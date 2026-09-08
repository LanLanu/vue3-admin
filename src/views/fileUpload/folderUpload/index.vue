<template>
  <div>
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :directory="true"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        点击上传或拖拽上传文件夹，<em
          >支持上传图片文件（格式支持png和jpeg，大小不超过8Mb）和视频文件（格式支持mp4和mkv，大小不超过200Mb）</em
        >
      </div>
    </el-upload>
    <div class="btn-area">
      <el-button @click.stop="selectFolder"
        >上传文件夹
        <input
          type="file"
          ref="folderInputRef"
          webkitdirectory
          @change="handleDrop"
          style="display: none"
        />
      </el-button>
      <el-button
        plain
        :loading="loading"
        :disabled="fileData.length == 0"
        @click="handleUploadAll"
        >开始上传</el-button
      >
      <el-button
        type="primary"
        style="margin-right: 16px"
        @click="handleCancleUpload"
        :disabled="cancleUploadDisabled"
        >取消上传</el-button
      >
      <el-button
        type="primary"
        link
        style="margin-right: 16px"
        @click="handleClean"
        :disabled="fileData.length == 0"
        >清空</el-button
      >
      <span>已经上传{{ successSum }}/200</span>
      <span style="color: red; margin-left: 10px">上传失败:{{ errorSum }}</span>
    </div>
    <el-table
      style="margin-top: 20px; width: 990px"
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
      <el-table-column prop="operate" label="操作" min-width="220px">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'waiting'"
            @click="handleBeginById(scope)"
            >开始上传</el-button
          >
          <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'uploading'"
            @click="handleCancleById(scope.row)"
            >取消上传</el-button
          >
          <el-button
            type="danger"
            size="small"
            :disabled="scope.row.status == 'uploading'"
            @click="handleDelete(scope)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from "vue";
import { useAppStore } from "@/store/modules/app";
import pLimit from "p-limit";
import axios from "axios";
import Worker from "@/utils/fileWorker?worker";
import { ElMessage, ElMessageBox } from "element-plus";
import { onBeforeRouteLeave } from "vue-router";
const fileData = ref([]);
const appStore = useAppStore();
const fileId = ref(0);
const loading = ref(false);
// 上传接口控制器
const abortControllerList = ref([]);
// 全局定义不适合多个一起执行，会被覆盖
// let worker = null;
const { proxy } = getCurrentInstance();
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
  //   console.log(">>>>>val", val);
  if (!limitConditions(file)) {
    return;
  }
  calulateMD5(file, file.uid);
};
// TOOD 限制上传速度最大200kb,中断上传文件请求和worker线程
const calulateMD5 = (file, id) => {
  fileData.value.push({
    index: fileData.value.length + 1,
    name: file.name,
    file,
    id,
    type: file.type?.split("/")[0],
    size: `${Math.ceil(file.size / 1024 / 1024).toFixed(2)}Mb`,
    progress: 0,
    hash: "",
    chunkList: [],
    status: "pending",
  });
  const worker = new Worker();
  // 启动子线程处理分片逻辑
  worker.postMessage({ file, id });
  // 监听子线程
  worker.onmessage = function (event) {
    // 必须使用传递过去的file的id，否则查询到的currentIndex不会变，原因：每个 Worker 实例的 onmessage 回调里面的 file，在部分执行场景会发生变量捕获错乱，在 onmessage 回调中依赖外部闭包变量 file
    const { chunkList, hash, id } = event.data;
    // console.log(">>>>>子线程返回的分片和hash", event.data);
    const currentIndex = fileData.value.findIndex((item) => item.id == id);
    fileData.value[currentIndex]["hash"] = hash;
    fileData.value[currentIndex].status = "waiting";
    fileData.value[currentIndex]["chunkList"] = chunkList;
    worker.terminate();
  };
  worker.onerror = (_) => {
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
const partUpload = (chunk, uploadId, index, parentIndex, signal) => {
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
        signal,
      },
    )
    .then(() => {
      if (fileData.value[parentIndex]["progress"] >= 99) return;
      fileData.value[parentIndex]["progress"] = Number(
        (index / fileData.value[parentIndex].chunkList.length) * 100,
      ).toFixed(2);
    });
};
// 上传文件夹
const selectFolder = () => {
  proxy.$refs.folderInputRef.click();
};
// 文件夹上传
const handleDrop = async (event) => {
  let files = [...event.target.files];
  console.log(">>>>event.target.files>", event.target.files);
  files = Array.from(files).filter((file) => limitConditions(file));
  console.log(">>>>files>", files);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!limitConditions(file)) {
      continue;
    }
    // TODO calulateMD5 是 for 循环同步快速循环，Worker 是异步。
    // 循环飞快跑完 i=0、i=1、i=2 …，立刻连续调用 calulateMD5(file)，函数内部会捕获循环当前的 file 变量；
    // 等到 worker.onmessage 异步回调触发的时候，所有回调里面的 file.uid 全部变成最后那一次循环的 file 的 uid，于是 findIndex 永远找到第一条匹配项，返回 0
    console.log(">>>>>file", file);
    const id = +new Date() + i;
    calulateMD5(file, id);
  }
};
// 上传-
const uploadFile = async (currentIndex, fileItem) => {
  const abortController = new AbortController();
  const signal = abortController.signal;
  const abortIndex = abortControllerList.value.findIndex(
    (item) => item.id == fileData.value[currentIndex].id,
  );
  if (
    abortIndex > -1 &&
    abortControllerList.value[abortIndex].abortController &&
    abortControllerList.value[abortIndex].abortController.signal.aborted
  ) {
    abortControllerList.value[abortIndex]["abortController"] = abortController;
  } else {
    abortControllerList.value.push({
      abortController,
      id: fileData.value[currentIndex].id,
    });
  }
  fileData.value[currentIndex].status = "uploading";
  const { hash, file, chunkList } = fileItem;
  let flag = false;
  try {
    // 所有切片chunkList,文件hash
    const res = await axios.post(
      "http://172.17.1.100:3000/bigFile/uploadSearch",
      {
        md5: hash,
      },
      { signal },
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
    } = await axios.post(
      "http://172.17.1.100:3000/bigFile/uploadInit",
      {
        name: file.name,
      },
      { signal },
    );
    let promises = [];
    promises = chunkList.map((item, index) =>
      plimit(() => partUpload(item, uploadId, index, currentIndex, signal)),
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
      { signal },
    );
    if (data.code == 1000) {
      console.log(">>>>>文件地址", data.data.url);
      fileData.value[currentIndex].progress = 100;
      fileData.value[currentIndex].status = "success";
      handleCleanByIdOrAll(fileData.value[currentIndex].id);
      ElMessage.success("文件上传成功！");
    } else {
      fileData.value[currentIndex].status = "error";
      ElMessage.error("失败！");
    }
  } catch (error) {
    if (axios.isCancel(error) || error.name === "AbortError") {
      fileData.value[currentIndex].status = "error";
      ElMessage.warning(`${fileItem.name}已取消上传`);
    }
  }
};
// 全部上传
const handleUploadAll = async () => {
  loading.value = true;
  let promiseList = [];
  for (let i = 0; i < fileData.value.length; i++) {
    const fileMsg = fileData.value[i];
    // 成功和等待MD5计算,上传中不会触发上传
    if (
      !fileMsg.hash ||
      fileMsg.status == "success" ||
      fileMsg.status == "uploading" ||
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
onUnmounted(() => {
  console.log(">>>>>卸载");
  handleClean();
});
const handleClean = () => {
  handleCleanByIdOrAll();
};
// 清空FIle对象和chunckList、abortController的内存引用
const handleCleanByIdOrAll = (id = "") => {
  if (id) {
    const index = fileData.value.findIndex((item) => item.id == id);
    if (index > -1) {
      fileData.value[index]["file"] = null;
      fileData.value[index]["chunkList"] = null;
    }
    const subIndex = abortControllerList.value.findIndex(
      (item) => item.id == id,
    );
    if (subIndex > -1) {
      fileData.value[subIndex]["abortController"] = null;
    }
  } else {
    fileData.value.length &&
      fileData.value.forEach((item) => {
        item.file = null;
        item.chunkList = null;
      });
    abortControllerList.value.length &&
      abortControllerList.value.forEach((item) => {
        item.abortController = null;
      });
    abortControllerList.value = [];
    fileData.value = [];
  }
};
// 取消上传
const handleCancleById = async (row) => {
  const index = abortControllerList.value.findIndex(
    (item) => item.id == row.id,
  );
  if (index > -1) {
    abortControllerList.value[index].abortController.abort();
  }
};
// 开始上传
const handleBeginById = (scope) => {
  uploadFile(scope.$index, scope.row);
};
const cancleUploadDisabled = computed(() => {
  if (fileData.value.length === 0) {
    return true;
  }
  if (fileData.value.every((item) => item.status == "uploading")) {
    return false;
  }
  return true;
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
// 取消上传
const handleCancleUpload = () => {
  abortControllerList.value.forEach((item) => {
    item.abortController.abort();
  });
};
// 删除
const handleDelete = (scope) => {
  handleCleanByIdOrAll(scope.row.id);
  const index = abortControllerList.value.findIndex(
    (item) => item.id == scope.row.id,
  );
  if (index > -1) abortControllerList.value.splice(index, 1);
  fileData.value.splice(scope.$index, 1);
};
onBeforeRouteLeave(async (to, from, next) => {
  console.log(">>>>>组件守卫");
  // 是否可以离开
  let flag = true;
  if (!fileData.value.length) {
    flag = true;
  } else {
    flag = fileData.value.some(
      (item) => item.status != "uploading" && item.status != "pending",
    );
  }
  if (flag) {
    next();
    return;
  } else {
    try {
      await ElMessageBox.confirm(
        "文件正在上传，离开页面会打断正在执行的上传任务，是否确认离开？",
        "警告",
        {
          confirmButtonText: "确认离开",
          cancelButtonText: "取消",
        },
      );
      // .then((res) => {
      //   next();
      // })
      // .catch((err) => {
      //   next(false);
      // });

      next();
    } catch (error) {
      next(false);
    }
  }
});
</script>
<style scoped lang="scss">
.btn-area {
  display: flex;
  align-items: center;
  margin-top: 16px;
}
</style>
