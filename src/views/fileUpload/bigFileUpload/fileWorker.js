import { getFileChunkAndHash } from "@/utils/index";
onmessage = function (event) {
  console.log(">>>分线程处理数据>>", event.data);
  const file = event.data;
  getFileChunkAndHash(file).then((res) => {
    // console.log('>>>>切片和hash>',res.chunkList,res.has);
    this.postMessage(res);
  });
};

// // 监听主线程发送过来的信息
// onmessage = function (event) {
//   console.log(">>>>>主线程的信息是", event.data);
//   this.postMessage(`我收到了,你发来的是${event.data}`);
// };
