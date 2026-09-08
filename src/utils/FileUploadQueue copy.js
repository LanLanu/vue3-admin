/**
 * 文件上传全局任务队列【单例】
 * 功能：
 * 1、全局最大并发文件数 maxConcurrentFile = 3，同一时间最多3个文件上传
 * 2、一键批量上传：进入普通等待队列，不抢占，有空闲槽位再执行
 * 3、用户手动点击【开始 / 继续上传】 → 执行抢占逻辑：
 *    👉 如果运行未满3个：直接运行
 *    👉 如果已经满3个：【随机暂停一个正在运行中的文件】腾出槽，当前点击任务立刻运行
 *    ✅ "全新文件点击开始" 和 "已暂停文件点击继续" 使用同一套抢占逻辑
 * 分层说明：
 * - 文件层队列：控制多少个【文件】可以同时跑
 * - 文件内部：分片继续使用 pLimit 控制分片axios并发，两者互不干扰
 */
class FileUploadQueue {
  constructor() {
    // 最大同时上传文件数量
    this.maxConcurrentFile = 3;

    /**
     * normalQueue：普通等待队列
     * 来源：一键上传按钮，批量添加进来的任务，不会抢占别人，排队等待空位
     * 结构 { fileId, fileItem, taskFn }
     */
    this.normalQueue = [];

    /**
     * pendingList：正在执行初始化阶段任务（uploadSearch / uploadInit）
     * 已经出队，但还没正式开始分片上传，同样占用并发名额
     */
    this.pendingList = [];

    /**
     * runningList：正在分片上传的文件任务列表
     * 结构 { fileId, fileItem, taskFn, abortController, promise }
     */
    this.runningList = [];

    // 调度锁：防止schedule被重复递归调用，造成逻辑错乱
    this.isScheduling = false;
  }

  /**
   * 【普通入队：一键上传】
   * 不会抢占，不会暂停正在运行任务，老老实实排队
   * @param {Object} fileItem 文件对象
   * @param {Function} taskFn 任务函数 ()=> uploadFile(fileItem)
   */
  addNormalTask(fileItem, taskFn) {
    const fileId = fileItem.id;
    // 去重判断：已经在普通队列 / pending / 正在运行，禁止重复添加
    if (this._isTaskExist(fileId)) return;

    this.normalQueue.push({
      fileId,
      fileItem,
      taskFn,
    });
    // 入队之后触发调度器，尝试跑等待队列里面的任务
    this.schedule();
  }

  /**
   * ⭐【核心抢占方法】手动点击【开始 / 继续上传】统一调用这个函数
   * 逻辑：
   * 1. 如果该任务已经正在运行：直接返回，什么都不干
   * 2. 如果运行队列没有占满3个：直接执行该任务，不需要暂停任何人
   * 3. 如果运行队列已经满了maxConcurrentFile：
   *    - 从runningList随机挑选一个正在上传的任务
   *    - 调用abort，把它暂停，移出runningList，释放一个并发槽位
   *    - 然后把当前传入的任务直接运行，不需要进等待队列
   * @param {Object} fileItem 文件对象
   * @param {Function} taskFn ()=> uploadFile(fileItem)
   */
  async preemptStart(fileItem, taskFn) {
    const fileId = fileItem.id;

    // 情况1：这个文件已经正在上传，直接退出，不要重复执行
    const isAlreadyRunning = this.runningList.some((r) => r.fileId === fileId);
    if (isAlreadyRunning) return;

    // 情况2：把这个任务从普通等待队列剔除掉（防止它同时存在普通队列，避免重复执行）
    this.normalQueue = this.normalQueue.filter(
      (item) => item.fileId !== fileId,
    );
    // 同时从pending移除（防止在初始化阶段）
    this.pendingList = this.pendingList.filter(
      (item) => item.fileId !== fileId,
    );

    // 情况3：判断运行队列是否已经达到最大并发3
    if (this.runningList.length >= this.maxConcurrentFile) {
      console.log("并发已满，需要随机暂停一个正在上传的文件，腾出槽位");
      // =====随机挑选一个正在运行的任务下标=====
      // Math.random()返回0~1，乘以数组长度，向下取整，拿到随机索引
      const randomIndex = Math.floor(Math.random() * this.runningList.length);
      const willPauseTask = this.runningList[randomIndex];

      console.log("被抢占暂停的文件id：", willPauseTask.fileId);
      // 调用内部方法，中止这个正在上传的任务，必须await，等待清理完成
      await this._abortRunningTask(willPauseTask.fileId);
    }

    // ✅现在一定有空闲槽位，直接执行当前点击的任务，不走等待队列
    const newTask = {
      fileId,
      fileItem,
      taskFn,
    };
    // ⚠️不要await，后台执行，不要阻塞抢占函数
    this._runSingleTask(newTask);

    // 执行完抢占，触发调度，看看普通队列有没有任务可以跑
    this.schedule();
  }

  /**
   * 外部调用：暂停某个指定文件（暂停按钮）
   * @param {string} fileId 文件id
   */
  async pauseFile(fileId) {
    console.log(">>>>>", 11);
    await this._abortRunningTask(fileId);
    console.log(">>>>>", 22);
    this.schedule();
  }

  /**
   * 内部工具：判断任务是否已经存在
   */
  _isTaskExist(fileId) {
    const inNormal = this.normalQueue.some((t) => t.fileId === fileId);
    const inPending = this.pendingList.some((t) => t.fileId === fileId);
    const inRun = this.runningList.some((r) => r.fileId === fileId);
    return inNormal || inPending || inRun;
  }

  /**
   * 内部工具：中止一个正在运行的任务
   * 1.拿到任务保存的abortController执行abort()，会中断该文件所有分片axios请求
   * 2.uploadFile会捕获AbortError，自动把文件状态改为 pause
   * 3.从runningList移除这个任务
   */
  async _abortRunningTask(fileId) {
    const idx = this.runningList.findIndex((r) => r.fileId === fileId);
    if (idx === -1) return;
    const task = this.runningList[idx];
    if (task.abortController) {
      // 触发abort，uploadFile内部axios全部cancel，进入catch，status变成pause
      task.abortController.abort();
      console.log(">>>>>", 3333);
    }
    // 从运行列表删除
    this.runningList.splice(idx, 1);
    console.log(">>>>>4444", this.runningList);
  }

  /**
   * 调度器主函数
   * 作用：每当【任务入队 / 任务完成 / 任务被抢占暂停】的时候调用
   * 计算空闲槽位，从普通队列取出任务去运行
   * 锁isScheduling：防止循环嵌套调用，避免重复执行
   */
  async schedule() {
    if (this.isScheduling) return;
    this.isScheduling = true;
    try {
      while (true) {
        // pending(初始化中) + running(分片上传中) 一起占用并发名额
        const usedSlot = this.pendingList.length + this.runningList.length;
        const freeSlot = this.maxConcurrentFile - usedSlot;
        // 没有空位，或者普通队列已经没有等待任务，直接跳出循环
        if (freeSlot <= 0 || this.normalQueue.length === 0) {
          break;
        }
        // 从普通队列头部取出任务执行
        const task = this.normalQueue.shift();
        this.pendingList.push(task);
        // 这里不要await，_runSingleTask内部自己处理promise，不要阻塞调度循环
        this._runSingleTask(task);
      }
    } finally {
      // 无论正常执行还是报错，锁必须释放，防止永久锁死调度器
      this.isScheduling = false;
    }
  }

  /**
   * 内部：执行单个文件上传任务
   * task.taskFn() 就是我们的 uploadFile(fileItem)
   * uploadFile必须返回 { abortController, promise }
   * abortController：用来以后抢占/暂停的时候中断请求
   * promise：整个文件全部上传完成的Promise（所有分片+合并接口）
   */
  async _runSingleTask(task) {
    try {
      // taskFn返回Promise对象，先拿到promise引用
      const taskResultPromise = task.taskFn();
      // 等待前置初始化逻辑完成（new AbortController、uploadSearch、uploadInit）
      const { abortController, promise } = await taskResultPromise;

      task.abortController = abortController;
      task.promise = promise;

      // 初始化完成，移出pending
      const pIdx = this.pendingList.findIndex((t) => t.fileId === task.fileId);
      if (pIdx >= 0) this.pendingList.splice(pIdx, 1);

      // 添加到正在分片上传列表
      this.runningList.push(task);

      // ⚠️必须await！等待分片+合并接口全部完成，才会进入finally释放槽位
      await task.promise;
    } catch (err) {
      console.error("_runSingleTask 任务异常：", err);
    } finally {
      // 无论成功 / 失败 / 被抢占中止，都要清理pending
      const pIdx = this.pendingList.findIndex((t) => t.fileId === task.fileId);
      if (pIdx >= 0) this.pendingList.splice(pIdx, 1);

      // ✅无论成功 / 失败 / 被抢占中止，都要把任务从运行列表移除
      const runIdx = this.runningList.findIndex(
        (r) => r.fileId === task.fileId,
      );
      if (runIdx >= 0) {
        this.runningList.splice(runIdx, 1);
      }
      // 文件结束，释放槽位，重新调度普通等待队列里面任务
      this.schedule();
    }
  }

  /**
   * 页面组件销毁的时候调用，清空队列，中止全部上传，防止后台继续跑请求
   */
  clearAll() {
    this.normalQueue = [];
    this.pendingList = [];
    // 遍历所有正在运行任务，全部中止
    [...this.runningList].forEach((task) => {
      if (task.abortController) {
        task.abortController.abort();
      }
    });
    this.runningList = [];
  }
}

// 单例导出，整个项目只实例化这一个队列实例
export const uploadQueue = new FileUploadQueue();
