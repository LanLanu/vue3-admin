<template>
  <div>
    <el-upload
      class="upload-demo"
      drag
      action="#"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        点击上传或拖拽上传<em
          >文件支持上传图片（格式支持png和jpeg，大小不超过8Mb）和视频（格式支持mp4和mkv，大小不超过200Mb）</em
        >
      </div>
    </el-upload>
    <el-progress :percentage="progress" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import pLimit from "p-limit";
import axios from "axios";
import Worker from "@/utils/fileWorker?worker";
import { ElMessage } from "element-plus";
let worker = null;
const progress = ref(0);
const plimit = pLimit(5);
const handleChange = async (val) => {
  progress.value = 0;
  const file = val.raw;
  console.log(">>>>>val", val);
  if (!limitConditions(file)) {
    return;
  }
  worker = new Worker();
  // 分片方案二
  // const { chunkList, hash } = await getFileChunkAndHash(file);
  // 启动子线程处理分片逻辑
  worker.postMessage(file);
  // 监听子线程
  worker.onmessage = function (event) {
    // 分片方案一
    const { chunkList, hash } = event.data;
    console.log(">>>>>子线程返回的分片和hash", event.data);
    try {
      uploadFile(file, hash, chunkList);
    } catch (error) {
      ElMessage.error(error);
    }
    worker.terminate();
  };
  worker.onerror = (_error) => {
    worker.terminate(); // 出错时也可以终止 Worker
  };
};
// 上传文件格式
const limitConditions = (file) => {
  // 限制条件
  const limitObj = {
    maxImgaeSize: 8, // Mb
    maxVideoSize: 200, // Mb
    // imageLimit: ["image/png", "image/jpeg", "image/gif"],
    imageLimit: ["png", "jpeg"],
    videoLimit: ["mp4", "mkv"],
  };
  // 得到小数点索引然后+1通过slice截取到小数点后面的后缀名
  const fileType = file.name.slice(file.name.lastIndexOf(".") + 1);
  const fileSize = Math.ceil(Number(file.size / (1024 * 1024)));
  // const image = limitObj.imageLimit.includes(file.type);
  // const video = limitObj.videoLimit.includes(file.type);
  const image = limitObj.imageLimit.includes(fileType);
  const video = limitObj.videoLimit.includes(fileType);
  // console.log(">>>>>是图片", image);
  // console.log(">>>>>是视频", video);
  const flag = image || video;
  if (!flag) {
    ElMessage.warning("请上传图片或视频！");
    return false;
  }
  if (
    (image && fileSize > limitObj.maxImgaeSize) ||
    (video && fileSize > limitObj.maxVideoSize)
  ) {
    ElMessage.warning("图片/视频文件大小超过限制！");
    return false;
  }
  return true;
};
// 分片上传-监听进度
const partUpload = (chunk, uploadId, index) => {
  axios
    .post(
      "http://172.17.1.100:3000/bigFile/uploadPart",
      {
        partFile: chunk,
        uploadId,
        partIndex: index,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    )
    .then(() => {
      if (progress.value < 100) {
        progress.value++;
      }
    });
};
// 上传
const uploadFile = async (file, hash, chunkList) => {
  let flag = false;
  // 所有切片chunkList,文件hash
  const res = await axios.post(
    "http://172.17.1.100:3000/bigFile/uploadSearch",
    {
      md5: hash,
    },
  );
  // console.log(">>>>>查询是否已经上传文件接口", res);
  if (res.data.code == 1000) {
    flag = res.data.data;
  }
  if (flag) {
    progress.value = 100;
    return console.log(">>>>>已经上传过了");
  }
  console.time("请求花费时间");
  const {
    data: { data: uploadId },
  } = await axios.post("http://172.17.1.100:3000/bigFile/uploadInit", {
    name: file.name,
  });
  let promises = [];
  promises = chunkList.map((item, index) =>
    plimit(() => partUpload(item, uploadId, index)),
  );
  // console.log(">>>>>uploadId", uploadId);
  // for (let i = 0; i < chunkList.length; i++) {
  //   promises.push(
  //     axios.post(
  //       "http://172.17.1.100:3000/bigFile/uploadPart",
  //       {
  //         partFile: chunkList[i],
  //         uploadId,
  //         partIndex: i,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     ),
  //   );
  // }

  // 统一并发
  await Promise.all(promises);
  const { data } = await axios.post(
    "http://172.17.1.100:3000/bigFile/uploadComplete",
    {
      uploadId,
      name: file.name,
      md5: hash,
    },
  );
  if (data.code == 1000) {
    console.log(">>>>>文件地址", data.data.url);
    progress.value = 100;
    ElMessage.success("文件上传成功！");
  } else {
    ElMessage.error("失败！");
  }
  console.timeEnd("请求花费时间");
};
onMounted(() => {
  // 共享实例：一个 Worker 实例能处理多个任务，但会串行处理任务，适合任务间不要求并行时使用,多个文件上传的话后端合并文件会错误执行，
  // worker = new Worker();
});
</script>
<style scoped lang="scss"></style>
