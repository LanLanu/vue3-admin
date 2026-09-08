import { getFileChunkAndHash } from "@/utils/index";
self.onmessage = function (event) {
  // console.log(">>>子线程处理数据>>", event.data);
  const { file, id } = event.data;

  // console.log(">>>>>file.id", event.data);
  getFileChunkAndHash(file).then((res) => {
    // console.log('>>>>切片和hash>',res.chunkList,res.hash);
    self.postMessage({ ...res, id: id ? id : "" });
  });
};

// // 监听主线程发送过来的信息
// onmessage = function (event) {
//   console.log(">>>>>主线程的信息是", event.data);
//   self.postMessage(`我收到了,你发来的是${event.data}`);
// };
