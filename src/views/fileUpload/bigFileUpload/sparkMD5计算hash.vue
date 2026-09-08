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
import SparkMD5 from "spark-md5";
const handleChange = (val) => {
  const file = val.raw;
  // 切片大小
  const chunkSize = 1024 * 1024 * 2; // 2Mb
  // 总的切片数量
  const chunks = Math.ceil(file.size / chunkSize);
  // 切片下标
  let currentChunk = 0;
  // spark作用:1.创建new SparkMD5.ArrayBuffer();  2.追加spark.append(this.result);  3.完成得到hash，spark.end();
  const spark = new SparkMD5.ArrayBuffer();
  const fileReader = new FileReader();
  fileReader.onload = function () {
    console.log(">>>>>读取到的对象result", this.result);
    // 做hash计算
    spark.append(this.result);
    currentChunk++; // 累加计算hash（增量hash）
    if (currentChunk < chunks) {
      loadNext();
    } else {
      // 全部读取完成
      const hash = spark.end();
      console.log(">>>>>最终hash", hash);
    }
  };
  fileReader.onerror = function (error) {
    console.log(">>读取失败>>>", error);
  };
  // 读取下一个方法
  function loadNext() {
    // 开始读取字节
    const start = currentChunk * chunkSize;
    // 结束字节  = 开始字节+切片大小 ，大于等于文件大小时使用文件大小，小于就累加切片大小
    const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    // 切片
    const chunk = file.slice(start, end);
    // 读取切片内容
    fileReader.readAsArrayBuffer(chunk); // 读取成功进入fileReader.onload方法，失败则进入onerror方法
  }
  // 默认执行一次
  loadNext();
};
</script>
<style scoped lang="scss"></style>
