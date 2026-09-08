/**
 * 迷你版优先级并发队列 (Mini P-Queue)
 * 核心原理：通过计数器控制并发，通过优先级数组控制执行顺序
 */
export default class MiniPQueue {
  /**
   * @param {number} concurrency 最大并发数
   */
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    // 当前正在执行的任务数
    this._pendingCount = 0;
    // 内部优先级队列：每个元素是一个对象 { task: Function, priority: number, resolve: Function, reject: Function }
    this._queue = [];
  }

  /**
   * 获取当前正在执行的任务数量
   */
  get pending() {
    return this._pendingCount;
  }

  /**
   * 添加一个任务到队列
   * @param {Function} task 需要执行的异步函数
   * @param {object} options 配置项，如 { priority: 1 }
   * @returns {Promise} 任务执行结果的 Promise
   */
  add(task, { priority = 0 } = {}) {
    return new Promise((resolve, reject) => {
      // 1. 将任务及其优先级、Promise的 resolve/reject 包装成一个对象，推入队列
      const item = { task, priority, resolve, reject };

      // 2. 【核心原理：优先级排序】
      // 我们需要把新任务插入到队列的正确位置。
      // 规则：优先级高的排在前面。如果优先级相同，先来的排在前面。
      // 我们从队列尾部往前找，找到第一个 priority >= 当前 priority 的位置，插在它后面。
      let insertIndex = this._queue.length;
      for (let i = this._queue.length - 1; i >= 0; i--) {
        if (this._queue[i].priority >= priority) {
          insertIndex = i + 1;
          break;
        }
      }
      // 在计算出的位置插入
      this._queue.splice(insertIndex, 0, item);

      // 3. 尝试启动任务
      this._runNext();
    });
  }

  /**
   * 内部方法：尝试从队列中取出任务并执行
   * 只要并发没满，且队列里有任务，就会一直执行
   */
  _runNext() {
    // 条件1：当前执行数 < 最大并发
    // 条件2：队列里还有任务
    while (this._pendingCount < this.concurrency && this._queue.length > 0) {
      // 从队列头部取出优先级最高的任务
      const item = this._queue.shift();

      // 并发计数 +1
      this._pendingCount++;

      // 执行用户的异步任务
      // 使用 Promise.resolve 包装，防止用户传入同步函数报错
      Promise.resolve()
        .then(() => item.task())
        .then((result) => {
          // 任务成功，触发外部 add 方法返回的 Promise 的 resolve
          item.resolve(result);
        })
        .catch((error) => {
          // 任务失败，触发 reject
          item.reject(error);
        })
        .finally(() => {
          // 【核心原理：事件驱动调度】
          // 无论成功还是失败，任务都结束了，并发计数 -1
          this._pendingCount--;
          // 并且立刻尝试运行队列里的下一个任务！
          this._runNext();
        });
    }
  }
}
