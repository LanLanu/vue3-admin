<template>
  <div>
    限速（MB）：<el-input-number v-model="maxSpeed" :step="1" step-strictly />
    上传个数：<el-input-number
      v-model="uploadNum"
      :step="1"
      disabled
      step-strictly
    />
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :directory="directoryFlag"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        点击上传或拖拽上传{{ directoryFlag ? "文件夹" : "文件" }}，<em
          >支持上传图片文件（格式支持png和jpeg，大小不超过8Mb）和视频文件（格式支持mp4和mkv，大小不超过4000Mb）</em
        >
        <b>限制worker线程计算MD5的数量</b>
      </div>
    </el-upload>
    <div class="btn-area">
      文件夹上传：
      <el-switch
        v-model="directoryFlag"
        active-text="开启"
        inactive-text="关闭"
      />
      <el-button @click.stop="selectFolder" v-if="directoryFlag"
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
        >一键上传</el-button
      >
      <!-- <el-button
        plain
        :loading="loading"
        :disabled="beginUploadDisabled"
        @click="handleUploadAll"
        >重新上传</el-button
      > -->
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
      <el-table-column prop="name" label="文件名称" min-width="110" />
      <!-- <el-table-column prop="type" label="文件类型" width="100">
        <template #default="{ row }">
          {{ row.type == "image" ? "图片" : "视频" }}
        </template>
      </el-table-column> -->
      <el-table-column prop="size" label="大小" min-width="150">
        <template #default="{ row }">
          <span>{{
            row.status == "success"
              ? formatSizeBytes(row.size)
              : formatSizeBytes(row.countMB)
          }}</span>
          /
          {{ formatSizeBytes(row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="remainTime" label="剩余时间" min-width="100">
        <template #default="{ row }">
          {{ row.remainTime }}
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="上传进度" min-width="170px">
        <template #default="{ row }">
          <div v-if="row.status == 'pause'">已暂停</div>
          <div v-else v-show="row.status == 'uploading'">
            {{ row.speedMB }}Mb/s
          </div>
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
          <!-- <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'uploading'"
            @click="handleCancleById(scope)"
            >取消上传</el-button
          > -->
          <el-button
            type="primary"
            size="small"
            :disabled="
              scope.row.status != 'pause' && scope.row.status != 'error'
            "
            @click="handleRestartUploadById(scope.row, scope.$index)"
            >重新上传</el-button
          >
          <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'uploading'"
            @click="handlePauseById(scope)"
            >暂停上传</el-button
          >
          <!-- <el-button
            type="primary"
            size="small"
            :disabled="scope.row.status != 'pending'"
            @click="handleCancleMD5ById(scope)"
            >取消计算MD5</el-button
          > -->
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
import axios from "axios";
import { formatSizeBytes, sleepAbort } from "@/utils";
import { md5Pool } from "@/utils/workerPool.js";
// import { uploadQueue } from "@/utils/FileUploadQueue.js";
import { UploadSpeedCalculator } from "@/utils/UploadSpeedCalculator.js";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import { onBeforeRouteLeave } from "vue-router";
let uploadUiTimer = null;
const fileData = ref([]);
const appStore = useAppStore();
const directoryFlag = ref(false);
const loading = ref(false);
// 上传接口控制器
const abortControllerList = ref([]);
// 全局定义不适合多个一起执行，会被覆盖
// let worker = null;
const { proxy } = getCurrentInstance();
const plimit = pLimit(1); // 限速上传分片不能多并发
// 期望平均上传速度 MB/s
const maxSpeed = ref(10);
const uploadNum = ref(3);
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
      size: file.size,
      progress: 0,
      uploadId: "",
      hash: "",
      chunkList: [],
      speedCalc: null,
      successChunkIndexList: new Set(), // 成功上传的分片索引
      status: "pending",
      speedMB: 0, // 上传速度
      countMB: 0, // 累计上传
      remainTime: 0,
      isSleepLimiting: false, // 标记「限速休眠中」，测速不要置 0
      chunkLoadedArr: [], // 分片上传接口对应的上传字节数
      // ⚠️快照放在fileObj上，不在class内部，消除竞态
      speedSnapshot: {
        time: 0,
        bytes: 0,
      },
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
    fileData.value[currentIndex]["chunkLoadedArr"] = new Array(
      chunkList.length,
    ).fill(0);
  } catch (error) {
    console.log("md5计算异常：", error);
    ElMessage.error(error);
    const currentIndex = fileData.value.findIndex((item) => item.id === id);
    if (currentIndex > -1) {
      fileData.value[currentIndex].status = "errorMD5";
    }
  }
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
    maxVideoSize: 4000, // Mb
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
  // 理论：这个分片按照目标速度，应该消耗多少秒
  const expectCostSec = chunk.size / (maxSpeed.value * 1024 * 1024);
  //   按照平均速度计算当前分片需要多少时间
  const expectCostMs = expectCostSec * 1000;
  const startTime = Date.now();

  await axios
    .post(
      "http://172.17.1.100:3000/bigFile/uploadPart",
      {
        partFile: chunk,
        uploadId: fileData.value[parentIndex].uploadId,
        partIndex: index,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal,
        // onUploadProgress是 XMLHttpRequest 的回调，是网络传输过程，不是后端接收完成，这正是我们想要的实时速度
        onUploadProgress: (progressEvent) => {
          // lengthComputable 布尔值：是否可以计算进度（是否知道完整总大小）
          if (!progressEvent.lengthComputable) return;
          // 保存当前这个分片实时已上传字节
          fileData.value[parentIndex].chunkLoadedArr[index] =
            progressEvent.loaded;
          // 🧮全部分片字节累加，得到【整个文件实时总已上传字节】
          const totalLoadedBytes = fileData.value[
            parentIndex
          ].chunkLoadedArr.reduce((sum, val) => sum + val, 0);
          // 测速计算，纯同步运算，可以高频调用
          fileData.value[parentIndex].speedCalc.update(totalLoadedBytes);
        },
      },
    )
    .then(() => {
      // 请求成功：这个分片100%上传完成，把该分片字节设置为分片真实大小
      fileData.value[parentIndex].chunkLoadedArr[index] = chunk.size;
      fileData.value[parentIndex].successChunkIndexList.add(index);
    })
    .catch((err) => {
      fileData.value[parentIndex].chunkLoadedArr[index] = 0;
    });
  // 分片上传完成，计算真实耗时，真实的分片上传完成时间
  const realCostMs = Date.now() - startTime;
  // 如果真实用时比期望用时短，需要sleep补齐时间
  const needSleepMs = Math.max(0, expectCostMs - realCostMs);
  try {
    if (needSleepMs > 0) {
      //   console.log(
      //     `限速休眠 ${needSleepMs} ms，真实${realCostMs}ms，期望${expectCostMs}ms`,
      //   );
      fileData.value[parentIndex].isSleepLimiting = true;
      await sleepAbort(needSleepMs, signal);
      // 休眠结束手动刷新测速时间戳，避免立刻判定超时归0
      //   fileData.value[parentIndex].speedCalc.latest.time = Date.now();
      fileData.value[parentIndex].isSleepLimiting = false;
    }
  } catch (error) {
    fileData.value[parentIndex].isSleepLimiting = false;
  } finally {
    fileData.value[parentIndex].isSleepLimiting = false;
  }
};
// 简单的时间格式化工具，复制一份到当前作用域
const formatTime = (seconds) => {
  let s = Math.ceil(seconds);
  const h = Math.floor(s / 3600);
  s = s % 3600;
  const m = Math.floor(s / 60);
  s = s % 60;
  if (h > 0) return `${h}小时${m}分${s}秒`;
  return `${m}分${s}秒`;
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
/**
 * 单个文件上传入口函数
 * @param {Object} fileItem - 文件对象，预先已经计算好md5，切好分片chunkList
 * @returns {Object} 返回给FileUploadQueue队列使用
 *   abortController：当前文件的中断控制器，队列抢占/暂停时调用abort()
 *   promise：代表【本文件完整上传生命周期】的Promise对象，队列await等待全部分片+合并完成
 */
const uploadFile = async (fileItem) => {
  // 找到fileData中当前这条文件数据的下标
  const currentIndex = fileData.value.findIndex(
    (item) => item.id == fileItem.id,
  );

  // 初始化测速快照时间戳，开启UI刷新定时器，每秒刷新上传速度/剩余时间界面
  fileData.value[currentIndex].speedSnapshot.time = Date.now();
  startUploadUiLoop();

  // 创建中断控制器：用于暂停、抢占替换任务、离开页面取消上传
  const abortController = new AbortController();
  const signal = abortController.signal;

  // 将控制器保存到全局控制器列表，外部暂停按钮可以拿到控制器执行abort
  const abortIndex = abortControllerList.value.findIndex(
    (item) => item.id == fileItem.id,
  );
  if (abortIndex > -1) {
    abortControllerList.value[abortIndex].abortController = abortController;
  } else {
    fileData.value[currentIndex].status = "uploading";
    abortControllerList.value.push({
      abortController,
      id: fileData.value[currentIndex].id,
    });
  }

  // 取出预先处理好的数据：md5哈希、原始File对象、切好的分片数组
  const { hash, file, chunkList } = fileItem;

  // 实例化测速计算器，传入文件总字节大小，用于计算上传速度、剩余时间
  fileData.value[currentIndex].speedCalc = new UploadSpeedCalculator(file.size);

  /**
   * taskPromise：代表【当前文件完整上传全流程】的Promise
   * 包含：断点查询 -> 初始化上传id -> 并发上传所有分片 -> 请求合并接口
   * ⚠️重要：所有提前退出分支，必须完成promise状态变更(resolve/reject)，不能裸return！
   * 裸return会造成Promise永久pending，队列await task.promise僵死，不会释放并发槽位
   */
  const taskPromise = new Promise(async (resolve, reject) => {
    try {
      // 如果没有uploadId，代表全新上传，先查询后端是否已经存在该md5文件
      if (!fileData.value[currentIndex].uploadId) {
        let flag = false;
        // 查询该md5文件是否后端已存在（秒传逻辑）
        const res = await axios.post(
          "http://172.17.1.100:3000/bigFile/uploadSearch",
          { md5: hash },
          { signal },
        );
        if (res.data.code == 1000) {
          flag = res.data.data;
        }

        // flag=true：后端已存在文件，直接秒传完成
        if (flag) {
          fileData.value[currentIndex].progress = 100;
          fileData.value[currentIndex].status = "success";
          console.log(">>>>>已经上传过了，执行秒传");
          // ✅秒传分支：必须resolve结束Promise，不能裸return！！
          return resolve("skip");
        }

        // 文件不存在，请求后端获取uploadId，开启本次分片上传会话
        const {
          data: { data: uploadId },
        } = await axios.post(
          "http://172.17.1.100:3000/bigFile/uploadInit",
          { name: file.name },
          { signal },
        );
        fileData.value[currentIndex].uploadId = uploadId;
      }

      // ==========开始并发上传分片==========
      const fileChunkLimit = pLimit(4);
      let promises = chunkList.map((item, index) =>
        fileChunkLimit(() => partUpload(item, index, currentIndex, signal)),
      );
      // 等待该文件所有分片请求全部执行完毕（不管成功失败，全部走完）
      await Promise.all(promises);

      // 全部分片上传完成，调用后端合并接口，通知后端组装完整文件
      const { data } = await axios.post(
        "http://172.17.1.100:3000/bigFile/uploadComplete",
        {
          uploadId: fileData.value[currentIndex].uploadId,
          name: file.name,
          md5: hash,
        },
        { signal },
      );

      // 合并接口返回成功，整个文件上传流程结束
      if (data.code == 1000) {
        console.log(">>>>>文件地址", data.data.url);
        fileData.value[currentIndex].progress = 100;
        fileData.value[currentIndex].speedMB = 0;
        fileData.value[currentIndex].status = "success";
        ElMessage.success("文件上传成功！");
        handleCleanByIdOrAll(fileData.value[currentIndex].id);
        // ✅正常上传完成，resolve结束Promise
        return resolve(true);
      } else {
        // 合并接口业务返回失败码
        const subIndex = abortControllerList.value.findIndex(
          (item) => item.id == fileItem.id,
        );
        if (subIndex > -1) {
          abortControllerList.value[subIndex]["abortController"] = null;
        }
        fileData.value[currentIndex].status = "error";
        ElMessage.error(data.message);
        // ✅业务失败，reject抛出异常，让外层队列捕获
        return reject(new Error(data.message));
      }
    } catch (error) {
      // 捕获异常：手动暂停、抢占abort、网络错误、接口报错全部走到这里
      if (axios.isCancel(error) || error.name === "AbortError") {
        // abort触发的取消，状态置为暂停
        fileData.value[currentIndex].status = "pause";
        ElMessage.warning(`${fileItem.name}已取消上传`);
        // ✅中断场景也要结束Promise，resolve标记取消，不要reject，视为正常终止
        return resolve("abort");
      } else {
        // 其余真实业务异常，向外抛出，交给队列catch处理
        reject(error);
      }
    }
  });

  // 返回给FileUploadQueue队列：控制器 + 完整上传Promise（已移除超时race包装）
  return {
    abortController,
    promise: taskPromise,
  };
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
  await uploadQueue.pauseFile(row.id);
};
// 暂停之后的-重新上传
const handleRestartUploadById = (row, $index) => {
  // 先算出当前已经上传的总字节
  const currentTotal = fileData.value[$index].chunkLoadedArr.reduce(
    (s, v) => s + v,
    0,
  );
  // 重置上传时间和数据
  fileData.value[$index].speedCalc.reset(currentTotal);
  uploadFile(row);
};
// 取消计算MD5
const handleCancleMD5ById = async ({ row, $index }) => {
  md5Pool.cancelTaskById(row.id);
  fileData.value[$index].status = "errorMD5";
};
/**
 * 点击单个文件【开始 / 继续上传】
 * 👉不管是全新等待文件，还是已经暂停的文件点继续，统一调用 preemptStart抢占方法
 * 如果并发已满3，随机杀掉一个正在上传，给自己腾位置
 */
const handleBeginById = (scope) => {
  uploadQueue.preemptStart(scope.row.id, () => uploadFile(scope.row));
};
// 一键上传 TODO 需要改进封装成队列uploadFile执行,将uploadFile放入队列执行
const handleUploadAll = async () => {
  // 成功和等待MD5计算不会触发上传
  const tempArr = fileData.value.filter((item) =>
    ["waiting", "error", "pause"].includes(item.status),
  );
  loading.value = true;
  //   let promiseList = [];
  for (const fileMsg of tempArr) {
    /**
     * 一键全部上传
     * 走普通队列，不抢占别人，老老实实排队
     */
    uploadQueue.addNormalTask(fileMsg, () => uploadFile(fileMsg));
  }
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
onMounted(() => {});

const handleClean = () => {
  // 清空引用File大内存的二进制数据
  handleCleanByIdOrAll();
  //  清空线程池
  md5Pool.cancelAllTask();
  uploadQueue.clearAll();
};
// 清空FIle对象和chunckList、abortController的内存引用
const handleCleanByIdOrAll = (id = "") => {
  if (id) {
    const index = fileData.value.findIndex((item) => item.id == id);
    if (index > -1) {
      fileData.value[index]["speedCalc"] = null;
      fileData.value[index]["chunkLoadedArr"] = null;
      fileData.value[index]["file"] = null;
      fileData.value[index]["chunkList"] = null;
      fileData.value[index]["speedSnapshot"] = null;
      fileData.value[index].successChunkIndexList.clear();
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
        item.speedCalc = null;
        item.chunkLoadedArr = null;
        item.speedSnapshot = null;
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
// 每一秒钟监听进度
const refreshUploadUi = () => {
  fileData.value.forEach((fileObj) => {
    if (!["uploading", "pause"].includes(fileObj.status)) return;
    const totalLoadedBytes = fileObj.chunkLoadedArr.reduce((s, v) => s + v, 0);
    let percentage = (totalLoadedBytes / fileObj.size) * 100;
    if (percentage >= 100) {
      percentage = 99.99;
    }
    fileObj["progress"] = Number(percentage).toFixed(2);
    fileObj.countMB = fileObj.speedCalc.latest.bytes;
    // 如果正在限速休眠，不执行归零逻辑
    if (fileObj.isSleepLimiting) {
      // 不重新calc
      // 正在主动限速休眠：显示设置的maxSpeed，不要置0，
      fileObj.speedMB = maxSpeed.value.toFixed(2);
      // 预估剩余时间可以简单算：剩余字节 / 限速
      const remainBytes = fileObj.size - totalLoadedBytes;
      const remainSec = remainBytes / (maxSpeed.value * 1024 * 1024);
      fileObj.remainTime = formatTime(remainSec);
      return;
    }
    const noInputMs = Date.now() - fileObj.speedCalc.latest.time;
    // fileObj.countMB = totalLoadedBytes;
    // 超过1秒没有真实网络数据，速度置0
    if (noInputMs >= 1000) {
      // 距离收到网络数据超过1000ms → 置0
      fileObj.speedMB = "0.00";
      fileObj.remainTime = "0分0秒";
    } else {
      // 传入保存在fileObj的快照做计算
      const ret = fileObj.speedCalc.calc(fileObj.speedSnapshot);
      fileObj.speedMB = ret.speedMB;
      fileObj.remainTime = ret.remainTime;
      // 把新快照写回fileObj，下一轮定时器使用
      fileObj.speedSnapshot = ret.newSnapshot;
      console.log(
        "最新字节:",
        fileObj.speedCalc.latest.bytes,
        "快照字节:",
        fileObj.speedSnapshot.bytes,
        "网速MB/s:",
        ret.speedMB,
      );
    }
  });
};
onUnmounted(() => {
  handleClean();
  stopUploadUiLoop();
});
const startUploadUiLoop = () => {
  if (uploadUiTimer) return;
  uploadUiTimer = setInterval(refreshUploadUi, 1000);
};
const stopUploadUiLoop = () => {
  if (uploadUiTimer) {
    clearInterval(uploadUiTimer);
    uploadUiTimer = null;
  }
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
