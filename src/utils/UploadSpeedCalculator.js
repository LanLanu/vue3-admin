/**
 * 大文件上传测速工具
 * 核心设计思路：
 * 1、规避并发竞态bug：类内部只保存【最新的进度点】，历史测速快照不放在类内部，交给外层业务fileObj保存
 * 2、onUploadProgress高频回调只做一件事：记录最新字节+时间戳，不做任何复杂运算、不修改历史快照
 * 3、真正的网速计算，统一收敛到定时器中执行，保证同一时间只有一处逻辑修改测速快照
 * 4、MAX_SPEED_MB 速度上限保护：防止极端异常计算出现天文数字（比如一瞬间deltaMs极小，算出来几GB/s的虚假速度）
 */
export class UploadSpeedCalculator {
  /**
   * @param {number} totalSize 文件总字节大小 file.size
   */
  constructor(totalSize) {
    // 文件总字节数，用于计算剩余字节、剩余时间
    this.totalSize = totalSize;

    /**
     * 网速最大保护上限 MB/s
     * 为什么要有这个值：
     * 浏览器onUploadProgress有时候会出现时间戳间隔极小，但是字节跳变很大，
     * 数学计算会产生虚假的几千上万MB/s的异常速度，UI展示会非常离谱。
     * 设置一个很大的值，正常业务几乎碰不到，只拦截异常毛刺。
     * 内网环境可以设置很大，比如10000MB/s；公网一般几十MB/s顶天。
     */
    this.MAX_SPEED_MB = 10000;

    /**
     * 仅保存【当前最新】的上传进度点
     * 来自 onUploadProgress 的实时回调，每次收到进度就覆盖更新
     * bytes：当前已经上传完成总字节
     * time：收到这个进度回调的时间戳 Date.now() 单位毫秒
     */
    this.latest = {
      bytes: 0,
      time: 0,
    };
  }

  /**
   * onUploadProgress 高频回调调用此方法
   * 只做：保存最新字节和当前时间戳，不计算速度，同步轻量运算，不怕高频触发
   * @param {number} loadedBytes 当前整个文件已经上传的总字节数（所有分片累加后的结果）
   */
  update(loadedBytes) {
    this.latest.bytes = loadedBytes;
    this.latest.time = Date.now();
  }

  /**
   * 【仅定时器调用】执行网速计算
   * 纯计算函数：输入上一次的快照，返回新速度、剩余时间、新的快照点
   * 不修改实例内部任何历史快照，新快照交给外层业务保存到fileObj
   * @param {{time:number, bytes:number}} prevSnapshot 上一轮定时器保存的快照 {time毫秒, bytes字节}
   * @returns {{speedMB:string, remainTime:string, newSnapshot:{time:number, bytes:number}}}
   */
  calc(prevSnapshot) {
    // curr：当前最新进度点，来自update更新的latest
    const curr = this.latest;

    // 时间差：本次和上一轮快照相隔多少毫秒
    const deltaMs = curr.time - prevSnapshot.time;
    // 字节差：这一段时间一共上传了多少字节
    const deltaBytes = curr.bytes - prevSnapshot.bytes;

    let speedMB = 0;

    // 有效条件：时间间隔大于0，并且确实有字节上传，才计算速度
    if (deltaMs > 0 && deltaBytes > 0) {
      // 毫秒转秒
      const sec = deltaMs / 1000;
      // B/s：每一秒上传多少字节
      const speedBps = deltaBytes / sec;
      // 转换成 MB/s  1MB = 1024 * 1024 byte
      speedMB = speedBps / 1024 / 1024;

      // 异常保护：如果算出来的速度超过上限，直接钳位到最大值，拦截毛刺虚假速度
      if (speedMB > this.MAX_SPEED_MB) {
        speedMB = this.MAX_SPEED_MB;
      }
    }

    // 剩余字节 = 文件总大小 - 当前已经上传字节
    const remainBytes = this.totalSize - curr.bytes;
    let remainSeconds = 0;

    // 速度大于0的时候，才可以估算剩余时间；速度为0，剩余时间直接0
    if (speedMB > 0) {
      // 剩余字节 / 每秒字节 = 需要多少秒上传完成
      remainSeconds = remainBytes / (speedMB * 1024 * 1024);
    }

    // 将总秒数，格式化为 天/小时/分/秒 的可读字符串
    const remainTime = this.formatTime(remainSeconds);

    return {
      // toFixed(2)保留两位小数用于页面展示
      speedMB: speedMB.toFixed(2),
      remainTime,
      /**
       * 新的快照点，交给外层fileObj保存
       * 下一轮定时器calc，就拿这个当做prevSnapshot
       * ⚠️重点：快照不能保存在class实例里面，
       * 因为onUploadProgress和定时器会并发读写class内部变量，造成竞态数据错乱
       */
      newSnapshot: {
        time: curr.time,
        bytes: curr.bytes,
      },
    };
  }

  /**
   * 重置测速状态，用于续传、重新上传文件场景
   * 注意：本方法只重置class内部latest；
   * 外层fileObj上面的 speedSnapshot 快照，业务代码必须手动同步重置！
   * @param {number} [currentLoaded] 当前已经上传的字节，续传时传入
   */
  reset(currentLoaded) {
    const val = typeof currentLoaded === "number" ? currentLoaded : 0;
    this.latest.bytes = val;
    this.latest.time = Date.now();
  }

  /**
   * 将总秒数，格式化为可读性时间字符串
   * 规则：大于24小时展示x天；大于60分钟展示x小时；小于60分钟展示x分；永远展示秒
   * 示例：
   * 35秒 → "35秒"
   * 70秒 → "1分10秒"
   * 3660秒 → "1小时1分0秒"
   * 90061秒 → "1天1小时1分1秒"
   * @param {number} seconds 剩余总秒数，可能是浮点数
   * @returns {string}
   */
  formatTime(seconds) {
    // 防止负数，网络异常会出现seconds为负
    if (seconds < 0) seconds = 0;

    const daySec = 24 * 60 * 60; // 一天多少秒
    const hourSec = 60 * 60; // 一小时多少秒
    const minSec = 60; // 一分钟多少秒

    // 向下取整天数
    const days = Math.floor(seconds / daySec);
    // 扣除天数，剩下的秒数
    let left = seconds % daySec;

    // 向下取整小时
    const hours = Math.floor(left / hourSec);
    left = left % hourSec;

    // 向下取整分钟
    const mins = Math.floor(left / minSec);
    // 剩下的秒数
    const secs = Math.floor(left % minSec);

    const parts = [];
    if (days > 0) parts.push(`${days}天`);
    if (hours > 0) parts.push(`${hours}小时`);
    if (mins > 0) parts.push(`${mins}分`);
    parts.push(`${secs}秒`);

    return parts.join("");
  }
}
