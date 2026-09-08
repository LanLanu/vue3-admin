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
        点击上传或拖拽上传文件夹，<em
          >支持上传图片文件（格式支持png和jpeg，大小不超过8Mb）和视频文件（格式支持mp4和mkv，大小不超过500Mb）</em
        >
        <b>限制worker线程计算MD5的数量</b>
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
        :disabled="startUploadDisabled"
        @click="handleUploadAll"
        >开始上传</el-button
      >
      <el-button
        plain
        :loading="loading"
        :disabled="beginUploadDisabled"
        @click="handleUploadAll"
        >重新上传</el-button
      >
      <el-button
        plain
        :disabled="calulateMD5AgainDisabled"
        @click="calulateMD5Again"
        >重新计算MD5</el-button
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
      style="margin-top: 20px; width: 1090px"
      :data="fileData"
      max-height="400"
      show-overflow-tooltip
      stripe
      border
    >
      <el-table-column prop="name" label="文件名称" width="80" />
      <el-table-column prop="type" label="文件类型" width="100">
        <template #default="{ row }">
          {{ row.type == "image" ? "图片" : "视频" }}
        </template>
      </el-table-column>
      <el-table-column prop="size" label="文件大小" width="80" />
      <el-table-column prop="progress" label="上传进度" min-width="120px">
        <template #default="{ row }">
          <el-progress :percentage="row.progress" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="上传状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatus(row.status).color">
            {{ getStatus(row.status).text }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="operate" label="操作" min-width="320px">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            :disabled="
              scope.row.status != 'waiting' && scope.row.status != 'error'
            "
            @click="handleBeginById(scope)"
            >开始上传</el-button
          >
          <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'uploading'"
            @click="handleCancleById(scope)"
            >取消上传</el-button
          >
          <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'pause'"
            @click="handleRestartUploadById(scope.row)"
            >重新上传</el-button
          >
          <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'uploading'"
            @click="handlePauseById(scope)"
            >暂停上传</el-button
          >
          <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'pending'"
            @click="handleCancleMD5ById(scope)"
            >取消计算MD5</el-button
          >
          <el-button type="danger" size="small" @click="handleDelete(scope)"
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
import {
  uploadInit,
  uploadComplete,
  uploadPart,
  uploadSearch,
} from "@/api/bigFile";
import axios from "axios";
import Worker from "@/utils/fileWorker?worker";
import { md5Pool } from "@/utils/workerPool.js";
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
  errorMD5: { color: "danger", text: "MD5计算失败" },
  pending: { color: "primary", text: "MD5计算中" },
  pause: { color: "primary", text: "暂停" },
  waiting: { color: "warning", text: "等待上传" },
  uploading: { color: "info", text: "上传中" },
  success: { color: "success", text: "上传成功" },
  error: { color: "danger", text: "上传失败" },
  cancle: { color: "danger", text: "已取消上传" },
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
/**
 * 计算MD5
 * @param file 文件对象
 * @param id 文件id
 * @param flag 是否添加到表格，应用于计算/重新计算MD5
 */
const calulateMD5 = async (file, id, flag = true) => {
  if (flag) {
    fileData.value.push({
      index: fileData.value.length + 1,
      name: file.name,
      file,
      id,
      type: file.type?.split("/")[0],
      size: `${Math.ceil(file.size / 1024 / 1024).toFixed(2)}Mb`,
      progress: 0,
      uploadId: "",
      hash: "",
      chunkList: [],
      successChunkIndexList: new Set(), // 成功上传的分片索引
      status: "pending",
    });
  } else {
    const i = fileData.value.findIndex((item) => item.id === id);
    fileData.value[i].status = "pending";
  }

  try {
    const result = await md5Pool.addTask(file, id);
    // 返回的id与传入有重名冲突，改为fileId，使用id的话循环造成混乱，使用传递过去线程和传递回来的id一样
    const { hash, chunkList, id: fileId } = result;
    // console.log(">>>>>11", hash, fileId);
    const currentIndex = fileData.value.findIndex((item) => item.id == fileId);
    fileData.value[currentIndex]["hash"] = hash;
    fileData.value[currentIndex].status = "waiting";
    fileData.value[currentIndex]["chunkList"] = chunkList;
  } catch (error) {
    console.log("md5计算异常：", error);
    ElMessage.error(error);
    const currentIndex = fileData.value.findIndex((item) => item.id === id);
    if (currentIndex > -1) {
      fileData.value[currentIndex].status = "errorMD5";
    }
  }
  //   const worker = new Worker();
  //   // 启动子线程处理分片逻辑
  //   worker.postMessage({ file, id });
  //   // 监听子线程
  //   worker.onmessage = function (event) {
  //     // 必须使用传递过去的file的uid，否则查询到的currentIndex不会变，原因：每个 Worker 实例的 onmessage 回调里面的 file，在部分执行场景会发生变量捕获错乱，在 onmessage 回调中依赖外部闭包变量 file
  //     const { chunkList, hash, id } = event.data;
  //     // console.log(">>>>>子线程返回的分片和hash", event.data);
  //     const currentIndex = fileData.value.findIndex((item) => item.id == id);
  //     fileData.value[currentIndex]["hash"] = hash;
  //     fileData.value[currentIndex].status = "waiting";
  //     fileData.value[currentIndex]["chunkList"] = chunkList;
  //     worker.terminate();
  //   };
  //   worker.onerror = (_) => {
  //     worker.terminate(); // 出错时也可以终止 Worker
  //   };
};
// 重新计算MD5
const calulateMD5Again = () => {
  const tempArr = fileData.value.filter((item) => item.status == "errorMD5");
  for (let i = 0; i < tempArr.length; i++) {
    const obj = tempArr[i];
    calulateMD5(obj.file, obj.id, false);
  }
};
const getStatus = (status) => {
  return statusTagMap[status];
};
// 上传文件格式
const limitConditions = (file) => {
  // 限制条件
  const limitObj = {
    maxImgaeSize: 8, // Mb
    maxVideoSize: 500, // Mb
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
const partUpload = async (chunk, index, parentIndex, signal) => {
  // 暂停不上传
  if (fileData.value[parentIndex].status == "pause") return;
  if (fileData.value[parentIndex].successChunkIndexList.has(index)) return;
  //   let currentSignal = null;
  //   // 所有请求的signal===true表明都失效，使用重新上传的signal
  //   if (signal === true) {
  //     const controller = new AbortController();
  //     fileData.value[parentIndex].abortControllers.set(index, controller);
  //     currentSignal = controller.signal;
  //   } else {
  //     currentSignal = signal;
  //   }
  // 创建控制器
  // signal.aborted === true
  //是否已经上传
  await uploadPart(
    {
      partFile: chunk,
      uploadId: fileData.value[parentIndex].uploadId,
      partIndex: index,
    },
    signal,
  )
    .then(() => {
      fileData.value[parentIndex].successChunkIndexList.add(index);
      if (fileData.value[parentIndex]["progress"] >= 99) return;
      fileData.value[parentIndex]["progress"] = Number(
        (fileData.value[parentIndex].successChunkIndexList.size /
          fileData.value[parentIndex].chunkList.length) *
          100,
      ).toFixed(2);
    })
    .catch((err) => {});
};
// 上传文件夹
const selectFolder = () => {
  proxy.$refs.folderInputRef.click();
};
// 文件夹上传
const handleDrop = async (event) => {
  let files = [...event.target.files];
  files = Array.from(files).filter((file) => limitConditions(file));
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!limitConditions(file)) {
      continue;
    }
    // TODO calulateMD5 是 for 循环同步快速循环，Worker 是异步。
    // 循环飞快跑完 i=0、i=1、i=2 …，立刻连续调用 calulateMD5(file)，函数内部会捕获循环当前的 file 变量；
    // 等到 worker.onmessage 异步回调触发的时候，所有回调里面的 file.uid 全部变成最后那一次循环的 file 的 uid，于是 findIndex 永远找到第一条匹配项，返回 0
    const id = +new Date() + i;
    calulateMD5(file, id);
  }
};
// 上传-TODO 需要接口改进 uploadFile让队列执行，否则文件夹上传一次性上传的才有plimit限制，多个上传没有加入plimit
/**
 * 上传文件
 * @param fileItem 文件数据
 */
const uploadFile = async (fileItem) => {
  const currentIndex = fileData.value.findIndex(
    (item) => item.id == fileItem.id,
  );
  const abortController = new AbortController();
  const signal = abortController.signal;
  const abortIndex = abortControllerList.value.findIndex(
    (item) => item.id == fileItem.id,
  );
  //   abortController.signal.aborted==true表示标记已经终止，因为执行了abortController.abort()
  if (
    abortIndex > -1 &&
    abortControllerList.value[abortIndex].abortController &&
    abortControllerList.value[abortIndex].abortController.signal.aborted
  ) {
    console.log(
      ">>>>>存在，就是暂停过控制器,只是执行过abortController.abort()，signal.aborted==true，表示请求终止过了",
    );
    abortControllerList.value[abortIndex][abortController] = abortController;
  } else {
    abortControllerList.value.push({
      abortController,
      id: fileData.value[currentIndex].id,
    });
  }
  fileData.value[currentIndex].status = "uploading";
  const { hash, file, chunkList } = fileItem;
  try {
    // 没有上传过
    if (!fileData.value[currentIndex].uploadId) {
      let flag = false;
      // 所有切片chunkList,文件hash
      const resultSearch = await uploadSearch({ md5: hash }, signal);
      console.log(">>>>>查询文件是否上传", resultSearch);
      if (resultSearch.code == 1000) {
        flag = resultSearch.data;
      }
      if (flag) {
        fileData.value[currentIndex].progress = 100;
        fileData.value[currentIndex].status = "success";
        return console.log(">>>>>已经上传过了");
      }
      //   console.time("请求花费时间");
      const resultInit = await uploadInit({ name: file.name }, signal);
      console.log(">>>>>初始化", resultInit);
      fileData.value[currentIndex].uploadId = resultInit.data;
    }
    let promises = [];
    promises = chunkList.map((item, index) =>
      plimit(() => partUpload(item, index, currentIndex, signal)),
    );
    // 统一并发
    await Promise.all(promises);
    const resultComplete = await uploadComplete(
      {
        uploadId: fileData.value[currentIndex].uploadId,
        name: file.name,
        md5: hash,
      },
      signal,
    );
    if (resultComplete.code == 1000) {
      console.log(">>>>>文件地址", resultComplete.data.url);
      fileData.value[currentIndex].progress = 100;
      fileData.value[currentIndex].status = "success";
      handleCleanByIdOrAll(fileData.value[currentIndex].id);
      ElMessage.success("文件上传成功！");
    } else {
      const subIndex = abortControllerList.value.findIndex(
        (item) => item.id == fileItem.id,
      );
      if (subIndex > -1) {
        abortControllerList.value[subIndex]["abortController"] = null;
      }
      fileData.value[currentIndex].status = "error";
      ElMessage.error("失败！");
    }
  } catch (error) {
    if (axios.isCancel(error) || error.name === "AbortError") {
      fileData.value[currentIndex].status = "pause";
      ElMessage.warning(`${fileItem.name}已取消上传`);
    }
  }
  try {
  } catch (error) {}
};

onMounted(() => {});
onUnmounted(() => {
  handleClean();
});
const handleClean = () => {
  // 清空引用File大内存的二进制数据
  handleCleanByIdOrAll();
  //  清空线程池
  md5Pool.cancelAllTask();
};
// 清空FIle对象和chunckList、abortController的内存引用
const handleCleanByIdOrAll = (id = "") => {
  if (id) {
    const index = fileData.value.findIndex((item) => item.id == id);
    if (index > -1) {
      fileData.value[index]["file"] = null;
      fileData.value[index]["chunkList"] = null;
      fileData.value[index].successChunkIndexList.clear();
    }
    const subIndex = abortControllerList.value.findIndex(
      (item) => item.id == id,
    );
    if (subIndex > -1) {
      abortControllerList.value[subIndex].abortController.abort();
      abortControllerList.value[subIndex]["abortController"] = null;
    }
  } else {
    fileData.value.length &&
      fileData.value.forEach((item) => {
        item.file = null;
        item.chunkList = null;
        item.successChunkIndexList.clear();
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
const handleCancleById = async ({ row, $index }) => {
  fileData.value[$index].status = "error";
  fileData.value[$index].uploadId = "";
  fileData.value[$index].successChunkIndexList.clear();
  const index = abortControllerList.value.findIndex(
    (item) => item.id == row.id,
  );
  if (index > -1 && abortControllerList.value[index].abortController) {
    abortControllerList.value[index].abortController.abort();
    abortControllerList.value[index].abortController = null;
  }
};
// 暂停上传
const handlePauseById = async ({ row, $index }) => {
  fileData.value[$index].status = "pause";
  const index = abortControllerList.value.findIndex(
    (item) => item.id == row.id,
  );
  if (index > -1 && abortControllerList.value[index].abortController) {
    abortControllerList.value[index].abortController.abort();
    // abortControllerList.value[index].abortController = null;
  }
};
// 暂停之后的-重新上传
const handleRestartUploadById = (row) => {
  uploadFile(row);
};
// 取消计算MD5
const handleCancleMD5ById = async ({ row, $index }) => {
  md5Pool.cancelTaskById(row.id);
  fileData.value[$index].status = "errorMD5";
};
// TODO 开始上传要封装队列-同handleUploadAll封装成队列uploadFile执行,将uploadFile放入队列执行
const handleBeginById = (scope) => {
  uploadFile(scope.row);
};
// 全部上传 TODO 需要改进封装成队列uploadFile执行,将uploadFile放入队列执行
const handleUploadAll = async () => {
  // 成功和等待MD5计算不会触发上传
  const tempArr = fileData.value.filter(
    (item) =>
      item.status == "waiting" ||
      item.status == "error" ||
      item.status == "pause",
  );
  loading.value = true;
  let promiseList = [];
  for (let i = 0; i < tempArr.length; i++) {
    const fileMsg = tempArr[i];
    // TODO 需要封装单例的提示框，不然一次性成功太多提示，当前文件对象值
    promiseList.push(() => uploadFile(fileMsg));
  }
  // 限制三个并发上传
  const limitFile = pLimit(3);
  const allPromises = promiseList.map((fn) => limitFile(fn));
  await Promise.all(allPromises);
  loading.value = false;
};
const calulateMD5AgainDisabled = computed(() => {
  if (fileData.value.length === 0) {
    return true;
  }
  if (fileData.value.some((item) => item.status == "errorMD5")) {
    return false;
  }
  return true;
});
const beginUploadDisabled = computed(() => {
  if (fileData.value.length === 0) {
    return true;
  }
  if (
    fileData.value.some(
      (item) => item.status == "error" || item.status == "pause",
    )
  ) {
    return false;
  }
  return true;
});
const startUploadDisabled = computed(() => {
  if (fileData.value.length === 0) {
    return true;
  }
  if (
    fileData.value.some(
      (item) =>
        item.status == "waiting" ||
        item.status == "error" ||
        item.status == "pause",
    )
  ) {
    return false;
  }
  return true;
});
const cancleUploadDisabled = computed(() => {
  if (fileData.value.length === 0) {
    return true;
  }
  if (fileData.value.some((item) => item.status == "uploading")) {
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
// 取消上传-正在上传的
const handleCancleUpload = () => {
  let ids = [];
  ids = fileData.value
    .filter((item) => (item.status = "uploading"))
    .map((item) => item.id);
  abortControllerList.value.forEach((item) => {
    if (ids.includes(item.id)) {
      item.abortController.abort();
    }
  });
  fileData.value.forEach((item) => {
    if (ids.includes(item.id)) {
      item.uploadId = "";
      item.successChunkIndexList.clear();
    }
  });
};
// 删除
const handleDelete = (scope) => {
  // 清空引用内存
  handleCleanByIdOrAll(scope.row.id);
  //   清空线程内存
  md5Pool.cancelTaskById(scope.row.id);
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
      (item) =>
        item.status != "uploading" &&
        item.status != "pending" &&
        item.status != "pause",
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
