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
  width: 146px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}
</style>
