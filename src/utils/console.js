const isDev = import.meta.env.VITE_MODE == "development";
// const isDev = false;
// console.log(">>>>>，isDev", isDev);
// 保存原始方法
const originalLog = console.log;
console.log = function (...args) {
  if (isDev) {
    originalLog.apply(console, args);
  }
};

// 同理可封装 console.info
console.info = function (...args) {
  if (isDev) {
    console.info.apply(console, args);
  }
};
