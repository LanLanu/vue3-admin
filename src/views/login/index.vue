<template>
  <div class="login-area">
    <el-form
      ref="formRef"
      style="max-width: 600px"
      :model="form"
      status-icon
      :rules="rules"
      label-width="100px"
      class="demo-form"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="验证码" prop="verifyCode">
        <el-input
          v-model="form.verifyCode"
          style="width: 100px"
          @keyup.enter="submitForm"
        />
        <Captcha ref="captchaRef" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="submitForm(formRef)"
          :loading="loading"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref } from "vue";
import Captcha from "./components/captcha.vue";
const formRef = ref(null);
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { login } from "@/api/user";
import { useUserStore } from "@/store/modules/user.js";
const useStore = useUserStore();
const router = useRouter();
const route = useRoute();
const captchaRef = ref(null);
const loading = ref(false);
const form = ref({
  username: "admin",
  password: "123456",
  verifyCode: "",
});

const rules = ref({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  verifyCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
});

const submitForm = async () => {
  await formRef.value.validate();
  try {
    loading.value = true;

    const res = await useStore.login({
      ...form.value,
      captchaId: captchaRef.value.captchaId,
    });
    console.log(">>>>>登录成功");
    ElMessage({
      message: "登录成功",
      type: "success",
      duration: 1500,
      onClose: () => {
        console.log(">>>>>", 111222);
        loading.value = false;
        const redirect = route.query.redirect || "/";
        console.log(">>>redirect>>", redirect);
        router.push(redirect);
      },
    });
  } catch (error) {
    loading.value = false;
    form.value.verifyCode = "";
    captchaRef.value.refresh();
  }
};

const resetForm = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>
<style scoped lang="scss">
.login-area {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ccc;
  height: 100vh;
  .el-form {
    width: 400px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
}
</style>
