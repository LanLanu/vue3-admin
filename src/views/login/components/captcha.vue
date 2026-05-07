<template>
  <div class="captcha-box" @click="refresh" v-html="svg"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { getCaptcha } from "@/api/user";
import { ElMessage } from "element-plus";
defineOptions({
  name: "Captcha",
});
const svg = ref("");
const captchaId = ref("");
const refresh = async () => {
  const data = await getCaptcha();
  if (data.code == 1000) {
    svg.value = data.data.data;
    captchaId.value = data.data.captchaId;
  }
};
onMounted(() => {
  refresh();
});
defineExpose({
  captchaId,
  refresh,
});
</script>
<style scoped lang="scss">
.captcha-box {
  width: 150px;
  height: 40px;
  background-color: #ccc;
  margin-left: 20px;
  ::v-deep(svg) {
    width: 100%;
    height: 100%;
  }
}
</style>
