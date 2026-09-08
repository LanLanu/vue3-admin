<template>
  <div>
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        点击上传或拖拽上传多个，<em
          >文件支持上传图片（格式支持png和jpeg，大小不超过8Mb）和视频（格式支持mp4和mkv，大小不超过200Mb）</em
        >
      </div>
    </el-upload>
    <div class="btn-area">
      <el-button
        plain
        style="margin-right: 16px"
        :loading="loading"
        @click="handleUploadAll"
        >上传所有文件</el-button
      >
      <el-button
        type="primary"
        link
        style="margin-right: 16px"
        @click="fileData = []"
        :disabled="fileData.length == 0"
        >清空</el-button
      >
      <span>已经上传{{ successSum }}/200</span>
      <span style="color: red; margin-left: 10px">失败:{{ errorSum }}</span>
    </div>
    <el-table
      style="margin-top: 20px; width: 900px"
      :data="fileData"
      max-height="400"
      show-overflow-tooltip
      stripe
      border
    >
      <el-table-column prop="name" label="文件名称" width="180" />
      <el-table-column prop="type" label="文件类型">
        <template #default="{ row }">
          {{ row.type == "image" ? "图片" : "视频" }}
        </template>
      </el-table-column>
      <el-table-column prop="size" label="文件大小" />
      <el-table-column prop="progress" label="上传进度" min-width="220px">
        <template #default="{ row }">
          <el-progress :percentage="row.progress" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="上传状态">
        <template #default="{ row }">
          <el-tag :type="getStatus(row.status).color">
            {{ getStatus(row.status).text }}</el-tag
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import pLimit from "p-limit";
import axios from "axios";
import Worker from "@/utils/fileWorker?worker";
import { ElMessage } from "element-plus";
const fileData = ref([]);
const fileId = ref(0);
const loading = ref(false);
// 全局定义不适合多个一起执行，会被覆盖
// let worker = null;
const progress = ref(0);
const plimit = pLimit(5);
const statusTagMap = {
  pending: { color: "primary", text: "MD5计算中" },
  waiting: { color: "warning", text: "等待上传" },
  uploading: { color: "info", text: "上传中" },
  success: { color: "success", text: "上传成功" },
  error: { color: "danger", text: "上传失败" },
};
const handleChange = async (val) => {
  const file = val.raw;
  console.log(">>>>>val", val);
  if (!limitConditions(file)) {
    return;
  }
  fileData.value.push({
    index: fileData.value.length + 1,
    name: file.name,
    file,
    id: file.uid,
    type: file.type?.split("/")[0],
    size: `${Math.ceil(file.size / 1024 / 1024).toFixed(2)}Mb`,
    progress: 0,
    hash: "",
    chunkList: [],
    status: "pending",
  });
  const worker = new Worker();
  // 分片方案二
  // const { chunkList, hash } = await getFileChunkAndHash(file);
  // 启动子线程处理分片逻辑
  worker.postMessage(file);
  // 监听子线程
  worker.onmessage = function (event) {
    // 分片方案一
    const { chunkList, hash } = event.data;
    console.log(">>>>>子线程返回的分片和hash", event.data);
    const currentIndex = fileData.value.findIndex(
      (item) => item.id == file.uid,
    );
    fileData.value[currentIndex]["hash"] = hash;
    fileData.value[currentIndex].status = "waiting";
    fileData.value[currentIndex]["chunkList"] = chunkList;
    worker.terminate();
  };
  worker.onerror = (_error) => {
    worker.terminate(); // 出错时也可以终止 Worker
  };
};
const getStatus = (status) => {
  return statusTagMap[status];
};
// 上传文件格式
const limitConditions = (file) => {
  // 限制条件
  const limitObj = {
    maxImgaeSize: 8, // Mb
    maxVideoSize: 200, // Mb
    // imageLimit: ["image/png", "image/jpeg", "image/gif"],
    imageLimit: ["png", "jpeg", "jpg"],
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
    ElMessage.warning(`${file.name}不是图片(png,jpeg)或视频(mp4,mkv)！`);
    return false;
  }
  if (
    (image && fileSize > limitObj.maxImgaeSize) ||
    (video && fileSize > limitObj.maxVideoSize)
  ) {
    ElMessage.warning(`${file.name}大小超过限制！`);
    return false;
  }
  return true;
};
// 分片上传-监听进度
const partUpload = (chunk, uploadId, index, parentIndex) => {
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
      if (fileData.value[parentIndex]["progress"] >= 99) return;
      fileData.value[parentIndex]["progress"] = Number(
        (index / fileData.value[parentIndex].chunkList.length) * 100,
      ).toFixed(2);
    });
};
// 上传-
const uploadFile = async (currentIndex, fileItem) => {
  fileData.value[currentIndex].status = "uploading";
  const { hash, file, chunkList } = fileItem;
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
    fileData.value[currentIndex].progress = 100;
    fileData.value[currentIndex].status = "success";
    return console.log(">>>>>已经上传过了");
  }
  //   console.time("请求花费时间");
  const {
    data: { data: uploadId },
  } = await axios.post("http://172.17.1.100:3000/bigFile/uploadInit", {
    name: file.name,
  });
  let promises = [];
  promises = chunkList.map((item, index) =>
    plimit(() => partUpload(item, uploadId, index, currentIndex)),
  );
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
    fileData.value[currentIndex].progress = 100;
    fileData.value[currentIndex].status = "success";
    ElMessage.success("文件上传成功！");
  } else {
    fileData.value[currentIndex].status = "error";
    ElMessage.error("失败！");
  }
  //   console.timeEnd("请求花费时间");
};
// 全部上传
const handleUploadAll = async () => {
  loading.value = true;
  let promiseList = [];
  for (let i = 0; i < fileData.value.length; i++) {
    const fileMsg = fileData.value[i];
    // 成功和等待MD5计算不会触发上传
    if (
      !fileMsg.hash ||
      fileMsg.status == "success" ||
      fileMsg.status == "pending"
    ) {
      // 跳过循环不执行后面的逻辑
      continue;
    }
    // TODO 需要封装单例的提示框，不然一次性成功太多提示，当前文件在文件数组的索引和对象值
    promiseList.push(() => uploadFile(i, fileMsg));
  }
  // 限制三个并发上传
  const limitFile = pLimit(3);
  const allPromises = promiseList.map((fn) => limitFile(fn));
  await Promise.all(allPromises);
  loading.value = false;
};
onMounted(() => {
  // 共享实例：一个 Worker 实例能处理多个任务，但会串行处理任务，适合任务间不要求并行时使用,多个文件上传的话后端合并文件会错误执行，
  // worker = new Worker();
});
const successSum = computed(() => {
  if (fileData.value.length === 0) {
    return 0;
  }
  return fileData.value.filter((item) => item.status === "success").length;
});
const errorSum = computed(() => {
  if (fileData.value.length === 0) {
    return 0;
  }
  return fileData.value.filter((item) => item.status === "error").length;
});
</script>
<style scoped lang="scss">
.btn-area {
  display: flex;
  align-items: center;
  margin-top: 16px;
}
</style>
