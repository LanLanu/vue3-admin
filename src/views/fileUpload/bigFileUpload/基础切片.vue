<template>
  <div>
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :auto-upload="false"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          jpg/png files with a size less than 500kb
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { ref } from "vue";
const handleChange = (val) => {
  // 单个切片大小5Mb
  const chunkSize = 1024 * 1024 * 5;
  const file = val.raw;
  // 计算分片数量
  const chunkNumber = Math.ceil(file.size / chunkSize);
  console.log(">>>>>切片数量", chunkNumber);
  // 切片数量
  const result = [];
  for (let i = 0; i < chunkNumber; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize > file.size ? file.size : start + chunkSize;
    const blob = file.slice(start, end);
    result.push(blob);
  }
  console.log(">>>>>所有切片", result);
};
</script>
<style scoped lang="scss"></style>
