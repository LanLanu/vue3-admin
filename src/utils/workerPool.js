// 导入你已经写好的worker文件 vite ?worker 模式
import Worker from "@/utils/fileWorker?worker";
/**
 * MD5 Worker线程池
 * class = 线程池的图纸模板
 * 作用：控制同时运行的worker最大数量，任务排队执行，防止无限创建worker占用内存
 * 新增：支持取消【排队中】和【正在运行】的MD5计算任务
 */
class Md5WorkerPool {
  /**
   * constructor 构造函数
   * new Md5WorkerPool(3) 的时候自动执行！
   * @param {number} maxNum 最大允许同时运行的worker数量，推荐2~4
   */
  constructor(maxNum) {
    // 最大并发worker数量
    this.maxConcurrent = maxNum;
    // 当前正在运行worker计数
    this.runningCount = 0;
    // 等待队列：还没开始执行的任务  [{file,id,resolve,reject}]
    this.waitQueue = [];
    /**
     * 运行中任务映射表
     * Map<fileId, { worker, task }>
     * 作用：保存正在执行的worker实例，支持随时强制终止线程
     */
    this.runningTaskMap = new Map();
  }

  /**
   * 【对外入口】提交md5计算任务
   * @param {File} file 文件
   * @param {string|number} id 文件唯一id
   * @returns Promise<{hash,chunkList,id}>
   */
  addTask(file, id) {
    return new Promise((resolve, reject) => {
      const taskItem = {
        file,
        id,
        resolve,
        reject,
      };
      this.waitQueue.push(taskItem);
      // 触发调度
      this.runTaskScheduler();
    });
  }

  /**
   * 【调度核心】自动拉取队列任务执行
   */
  runTaskScheduler() {
    // 无等待任务 或者 达到并发上限，直接退出
    if (
      this.waitQueue.length === 0 ||
      this.runningCount >= this.maxConcurrent
    ) {
      return;
    }
    // 取出队首任务
    const currentTask = this.waitQueue.shift();
    this.runningCount++;
    // 创建worker
    const worker = new Worker();
    // 将worker和任务存入运行Map，方便随时终止
    this.runningTaskMap.set(currentTask.id, {
      worker,
      task: currentTask,
    });
    // 发送文件进入子线程计算
    worker.postMessage({
      file: currentTask.file,
      id: currentTask.id,
    });
    // 计算成功回调
    worker.onmessage = (event) => {
      const { chunkList, hash, id } = event.data;
      currentTask.resolve({ chunkList, hash, id });
      this.taskFinishClean(id, worker);
    };
    // worker异常
    worker.onerror = (err) => {
      currentTask.reject(new Error(`文件hash计算失败：${err.message}`));
      this.taskFinishClean(currentTask.id, worker);
    };
  }

  /**
   * 任务结束统一清理（成功/报错都会执行）
   * @param {string|number} fileId 文件id
   * @param {Worker} worker 当前worker实例
   */
  taskFinishClean(fileId, worker) {
    // 销毁子线程
    worker.terminate();
    // 从运行记录表删除
    if (this.runningTaskMap.has(fileId)) {
      const runInfo = this.runningTaskMap.get(fileId);
      // 释放文件引用
      runInfo.task.file = null;
      this.runningTaskMap.delete(fileId);
    }
    // 运行数量减少
    this.runningCount--;
    // 继续调度下一个任务
    this.runTaskScheduler();
  }

  /**
   * 根据文件ID，一键取消任务（兼容：排队中 + 正在运行）
   * @param {string|number} targetId 文件id
   * @returns {boolean} true：成功取消；false：找不到任务（已完成/不存在）
   */
  cancelTaskById(targetId) {
    // 1. 优先判断：任务是否正在运行
    if (this.runningTaskMap.has(targetId)) {
      const runInfo = this.runningTaskMap.get(targetId);
      const { worker, task } = runInfo;
      // 杀死worker子线程，终止md5计算
      worker.terminate();
      // 释放文件引用
      task.file = null;
      // 将Promise标记为失败，外部await可以捕获取消
      task.reject(new Error("任务被手动终止"));
      // 从运行表清除记录
      this.runningTaskMap.delete(targetId);
      // 运行计数器-1
      this.runningCount--;
      // 腾出空位，尝试执行下一个排队任务
      this.runTaskScheduler();
      return true;
    }

    // 2. 不在运行中 → 去等待队列删除排队任务
    return this.removeWaitTaskById(targetId);
  }

  /**
   * 内部方法：只移除【排队队列】中的任务
   * @param {string|number} targetId
   * @returns {boolean}
   */
  removeWaitTaskById(targetId) {
    const targetIndex = this.waitQueue.findIndex(
      (task) => task.id === targetId,
    );
    if (targetIndex === -1) return false;

    const removeTask = this.waitQueue[targetIndex];
    // 释放文件内存
    removeTask.file = null;
    removeTask.reject(new Error("排队任务被取消"));
    // 删除队列元素
    this.waitQueue.splice(targetIndex, 1);
    return true;
  }

  /**
   * 清空所有排队任务（不会影响正在运行的worker）
   */
  clearWaitTask() {
    this.waitQueue.forEach((task) => {
      task.file = null;
    });
    this.waitQueue = [];
  }

  /**
   * 【拓展】强制取消所有任务（排队+全部正在运行）
   */
  cancelAllTask() {
    // 1. 清空排队队列
    this.clearWaitTask();

    // 2. 循环终止所有正在运行的worker
    for (const [fileId, runInfo] of this.runningTaskMap) {
      const { worker, task } = runInfo;
      worker.terminate();
      task.file = null;
      task.reject(new Error("全部任务被取消"));
    }
    this.runningTaskMap.clear();
    this.runningCount = 0;
  }
}
// 自动计算并发数量
function getSuitableWorkerCount() {
  // navigator.hardwareConcurrency老版本不支持的话返回null，就使用4
  const cpu = navigator.hardwareConcurrency ?? 4; // ?? 运算符：空值合并运算符 a ?? b ，如果 a 是 null 或者 undefined，结果取 b，如果 a 是数字 0、false、''，依旧使用 a 本身，不会走后面默认值
  // 约束区间 2 ~ 4
  console.log(">>>>>线程数量", cpu);
  return Math.max(2, Math.min(cpu - 2, 4));
}
// 创建全局单例线程池，最大并发3个worker，按需修改
// export const md5Pool = new Md5WorkerPool(3);
// 自动传入动态数值
export const md5Pool = new Md5WorkerPool(getSuitableWorkerCount());
