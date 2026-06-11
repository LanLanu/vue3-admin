<template>
  <div class="error-page">
    <div class="error-box">
      <h1 class="code">404</h1>
      <p class="msg">页面走丢啦</p>
      <p class="desc">您访问的页面不存在或已删除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();

const goHome = () => {
  router.push("/dashboard/console");
};
</script>

<style scoped>
.error-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.error-box {
  text-align: center;
}
.code {
  font-size: 120px;
  color: #e6a23c;
  margin: 0;
  line-height: 1;
}
.msg {
  font-size: 24px;
  color: #333;
  margin: 20px 0 10px;
}
.desc {
  color: #999;
  margin-bottom: 30px;
}
</style>
