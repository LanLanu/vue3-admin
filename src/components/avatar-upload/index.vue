<template>
  <div class="avatar-area">
    <el-upload
      class="avatar-uploader"
      action="#"
      :show-file-list="false"
      name="file"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
      :http-request="upload"
    >
      <div v-if="props.modelValue" class="avatar">
        <img :src="props.modelValue" style="width: 100%; height: 100%" />
        <div class="modal-mask">
          <el-icon class="delete-icon" @click.stop="handleDel">
            <Delete />
          </el-icon>
        </div>
      </div>
      <el-icon v-else class="avatar-uploader-icon">
        <Plus />
      </el-icon>
    </el-upload>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Worker from "@/utils/fileWorker?worker";
import { ElMessage } from "element-plus";
import pLimit from "p-limit";
import {
  uploadInit,
  uploadComplete,
  uploadPart,
  uploadSearch,
} from "@/api/bigFile";
import { Plus } from "@element-plus/icons-vue";
const plimit = pLimit(2);
import request from "@/utils/request";
const emits = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  limit: {
    type: Number,
    default: 2 * 1024 * 1024, // 2Mb
  },
  accept: {
    type: Array,
    default() {
      return ["image/jpeg", "image/png", "image/gif"];
    },
  },
});
const handleAvatarSuccess = (response, uploadFile) => {
  console.log(">>>>uploadFile1111111111>", uploadFile);
};
const upload = (options) => {
  let worker = null;
  const file = options.file;
  worker = new Worker();
  // 启动子线程处理分片逻辑
  worker.postMessage({ file });
  // 监听子线程
  worker.onmessage = async function (event) {
    const { chunkList, hash } = event.data;
    let flag = false;
    const resultSearch = await uploadSearch({ md5: hash });
    if (resultSearch.code == 1000) {
      console.log(">>>>>resultSearch.data", resultSearch);
      flag = resultSearch.data;
      emits("update:modelValue", resultSearch.fileUrl);
    }
    if (flag) {
      return console.log(">>>>>已经上传过了");
    }
    console.log(">>>>>子线程返回的分片和hash", event.data);
    try {
      uploadFiles(file, hash, chunkList);
    } catch (error) {
      ElMessage.error(error);
    }
    worker.terminate();
  };
  worker.onerror = (_error) => {
    worker.terminate(); // 出错时也可以终止 Worker
  };
  //   request
  //     .post(
  //       "/app/base/comm/upload",
  //       { file: options.file },
  //       { headers: { "Content-Type": "multipart/form-data" } },
  //     )
  //     .then((res) => {
  //       console.log(">res>>>>", res);
  //       if (res.code == 1000) {
  //         emits("update:modelValue", res.data);
  //         ElMessage.success("上传成功");
  //       }
  //     });
};
// 上传
const uploadFiles = async (file, hash, chunkList) => {
  console.time("请求花费时间");
  const resultInit = await uploadInit({ name: file.name });
  let promises = [];
  promises = chunkList.map((item, index) =>
    plimit(() => partUpload(item, resultInit.data, index)),
  );
  // 统一并发
  await Promise.all(promises);
  const resultComplete = await uploadComplete({
    uploadId: resultInit.data,
    name: file.name,
    md5: hash,
  });

  if (resultComplete.code == 1000) {
    emits("update:modelValue", resultComplete.data.url);
    console.log(">>>>>文件地址", resultComplete.data.url);
    ElMessage.success("头像上传成功！");
  } else {
    ElMessage.error("失败！");
  }
  console.timeEnd("请求花费时间");
};
// 分片上传-监听进度
const partUpload = async (chunk, uploadId, index) => {
  try {
    await uploadPart({
      partFile: chunk,
      uploadId: uploadId,
      partIndex: index,
    });
  } catch (error) {
    console.log(">>>>>error", error);
  }
};
const beforeAvatarUpload = (rawFile) => {
  if (!props.accept.includes(rawFile.type)) {
    ElMessage.error("头像仅支持jpg/png/gif格式!");
    return false;
  } else if (rawFile.size > props.limit) {
    ElMessage.error("图片大小超过2M!");
    return false;
  }
  return true;
};
const handleDel = () => {
  emits("update:modelValue", "");
};
</script>
<style scoped lang="scss">
.avatar-area {
  // width: 100px;
  // height: 100px;
}

.modal-mask {
  display: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
  z-index: 11;
  cursor: default;
}

.avatar:hover {
  .modal-mask {
    display: flex;
  }
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  position: relative;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.delete-icon {
  font-size: 22px;
  color: #fff;
  text-align: center;
  cursor: pointer;
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}
</style>
