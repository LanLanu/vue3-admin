import store2 from "store2";
import SparkMD5 from "spark-md5";

/**
 * 菜单数据树形结构
 * @param {*} list
 * @returns
 */
export function deepTree(list = []) {
  const result = [];
  let map = {};
  //   添加id对应他的映射{1:{id:1,...}}
  for (const item of list) {
    map[item.id] = { ...item };
  }
  // 添加子集
  for (const item of list) {
    // 是父级
    if (!item.parentId) {
      result.push(map[item.id]);
    } else {
      // 找到父级添加children
      if (map[item.parentId]["children"]) {
        // 直接修改引入的父级堆内存，添加进result的父级堆内存同样改变
        map[item.parentId]["children"].push(map[item.id]);
      } else {
        map[item.parentId]["children"] = [map[item.id]];
      }
    }
  }
  return result;
}
/**
 * 判断是否有子集
 * @param {*} list
 * @param {*} id
 * @returns {Boolean}
 *  true 表示无子集
 *  false 表示有子集
 */
export function isLeaf(list, id) {
  return list.every((item) => item.parentId !== id);
}

export function setRefreshToken(payload) {
  store2.set("refreshToken", payload);
}
export function getRefreshToken() {
  return store2.get("refreshToken");
}
export function setToken(payload) {
  store2.set("token", payload);
}
export function getToken() {
  return store2.get("token");
}
/**
 *
 * @param {sizeBytes}  字节大小
 * @returns 格式化字节
 */
export function formatSizeBytes(sizeBytes) {
  if (sizeBytes <= 0) return "0";
  const units = ["B", "KB", "MB", "GB", "TB", "Pb"];
  let unitIndex = 0;
  let size = sizeBytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  // 自动处理小数位，避免 1.00Kb 这种冗余
  const formattedSize = size % 1 === 0 ? size : size.toFixed(2);
  return `${formattedSize}${units[unitIndex]}`;
}
/**
 * 动态计算分片大小
 * @param {number} fileSize 文件总字节
 * @returns {number} chunkSize 分片字节
 */
function getChunkSize(fileSize) {
  const MIN_CHUNK = 2 * 1024 * 1024; // 最小分片 2MB，不能更小，否则请求太多
  const MAX_CHUNK = 20 * 1024 * 1024; // 最大分片 20MB，不能超过后端nginx限制
  // 策略：总文件越大，分片适当变大；保证分片数量在 10~50 片区间最合适
  let chunkSize = Math.ceil(fileSize / 30);

  // 钳位，不能小于最小，不能大于最大
  chunkSize = Math.max(MIN_CHUNK, Math.min(chunkSize, MAX_CHUNK));
  return chunkSize;
}
/**
 * 可中断sleep，支持abortSignal
 * @param {number} ms
 * @param {AbortSignal} signal
 */
export function sleepAbort(ms, signal) {
  console.log(">>>>>启动睡眠函数");
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error("abort"));
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new Error("abort"));
    });
  });
}
/**
 * 异步操作，读取一个文件的所有切片与最终hash
 * @param {*} file
 * @returns Promise
 */
export function getFileChunkAndHash(file) {
  console.time("切片处理");
  return new Promise((resolve) => {
    // 切片集合[Blob,Blob...]
    const chunkList = [];
    // 切片大小
    const chunkSize = getChunkSize(file.size); // 5Mb
    console.log(">>>>>切片大小", chunkSize);
    // 总的切片数量
    const chunks = Math.ceil(file.size / chunkSize);
    console.log(">>>>>切片数量", chunks);
    // 切片下标
    let currentChunk = 0;
    // spark作用:1.创建new SparkMD5.ArrayBuffer();  2.追加spark.append(this.result);  3.完成得到hash，spark.end();
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    fileReader.onload = function () {
      // console.log(">>>>>读取到的对象result", this.result);
      // 做hash计算
      spark.append(this.result);
      currentChunk++; // 累加计算hash（增量hash）
      if (currentChunk < chunks) {
        loadNext();
      } else {
        // 全部读取完成
        const hash = spark.end();
        console.timeEnd("切片处理");
        resolve({
          chunkList,
          hash,
        });
        // console.log(">>>>>最终hash", hash);
      }
    };
    fileReader.onerror = function (error) {
      console.log(">>读取失败>>>", error);
    };
    // 读取下一个方法
    function loadNext() {
      // 开始读取字节
      const start = currentChunk * chunkSize;
      // 结束字节  = 开始字节+切片大小 ，大于等于文件大小时使用文件大小，小于就累加切片大小
      const end =
        start + chunkSize >= file.size ? file.size : start + chunkSize;
      // 切片
      const chunk = file.slice(start, end);
      // 追加切片数据
      chunkList.push(chunk);
      // 读取切片内容
      fileReader.readAsArrayBuffer(chunk); // 读取成功进入fileReader.onload方法，失败则进入onerror方法
    }
    // 默认执行一次
    loadNext();
  });
}
