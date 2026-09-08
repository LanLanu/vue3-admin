<template>
  <div class="login-area">
    <div class="background-area"></div>
    <div class="logo-area">
      <div class="logo-title"><i></i> <span>后台管理系统</span></div>
      <div class="logo-welcome">
        <img src="../../assets/image/login_bg.svg" alt="" />
        <span>欢迎使用Blue后台管理系统</span>
      </div>
    </div>
    <div class="login-form">
      <div class="login-form-title">登录</div>
      <el-form
        style="width: 300px"
        ref="formRef"
        :rules="rules"
        status-icon
        :model="form"
        label-width="0"
        label-position="right"
        :hide-required-asterisk="true"
      >
        <el-form-item label="" prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名：admin/用户甲"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码：123456"
            show-password
            size="large"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item label="" prop="verifyCode" class="captcha">
          <el-input
            v-model="form.verifyCode"
            placeholder="验证码"
            size="large"
            style="width: 140px"
            @keyup.enter="submitForm"
          >
            <template #prefix>
              <i class="iconfont icon-yanzhengma"></i>
            </template>
          </el-input>
          <Captcha ref="captchaRef" />
        </el-form-item>
        <el-checkbox v-model="rememberPwd" label="记住密码" />
        <el-form-item>
          <el-button
            class="login-btn"
            :loading="loading"
            type="primary"
            @click="submitForm(formRef)"
            size="large"
            >登录</el-button
          >
        </el-form-item>
      </el-form>

      <div class="login-more-option">
        <span>更多方式：</span>
        <i title="微信" class="iconfont icon-weixin-copy"></i>
        <i title="微博" class="iconfont icon-weibo"></i>
        <i title="抖音" class="iconfont icon-douyin"></i>
        <i title="github" class="iconfont icon-icon-test31"></i>
        <i title="QQ" class="iconfont icon-QQ"></i>
        <i title="支付宝" class="iconfont icon-zhifubaozhifu1"></i>
      </div>
    </div>
    <div class="copyright">
      <a href="https://beian.miit.gov.cn/#/Integrated/index"
        >粤ICP备2026125638号-1&nbsp;&nbsp;</a
      >
      <a href="#">后台管理系统&copy;company</a>
    </div>
  </div>
  <!-- <UploadFile /> -->
  <!-- <VideoConnet /> -->
</template>
<script setup>
import { ref, onMounted } from "vue";
import Captcha from "./components/captcha.vue";
const formRef = ref(null);
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { login } from "@/api/user";
import { useUserStore } from "@/store/modules/user.js";
import { User, Lock } from "@element-plus/icons-vue";
const useStore = useUserStore();
const router = useRouter();
const route = useRoute();
const captchaRef = ref(null);
const loading = ref(false);
const rememberPwd = ref(true);
const form = ref({
  username: "",
  password: "",
  verifyCode: "",
});
onMounted(() => {
  if (import.meta.env.VITE_MODE == "development") {
    form.value.username = "admin";
    form.value.password = "123456";
  } else {
    // form.value.username = "测试用户甲";
    // form.value.password = "123456";
  }
});
const rules = ref({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  verifyCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
});

const submitForm = async () => {
  console.log(">>>>>1", import.meta.env.VITE_MODE);
  // if (
  //   import.meta.env.VITE_MODE != "development" &&
  //   form.value.username == "admin" &&
  //   form.value.password == "123456"
  // ) {
  //   return ElMessage.error("账号或密码错误，此密码已被'测试用户甲'占用~");
  // }
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
a {
  text-decoration: none;
  font-size: 12px;
}
.captcha {
  ::v-deep(.el-form-item__content) {
    justify-content: space-between;
  }
}

.login-area {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;

  .logo-area {
    width: 400px;
    height: 600px;
    margin-left: 200px;
    text-align: center;
    z-index: 1;
    // background-color: rgba(0, 0, 0, 0.2);

    .logo-welcome {
      margin-top: 0px;
      font-size: 30px;
      color: #fff;

      img {
        width: 400px;
        height: 200px;
        margin-bottom: 40px;
      }
    }

    .logo-title {
      height: 50px;
      margin-bottom: 60px;
    }

    i {
      margin-right: 16px;

      img {
        vertical-align: sub;
      }
    }

    span {
      font-size: 30px;
      color: #fff;
    }
  }

  .login-form {
    margin-right: 140px;
    width: 400px;
    height: 440px;
    display: flex;
    flex-direction: column;
    align-items: center;
    // background-color: antiquewhite;
    box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    z-index: 1;
    background-color: #fff;

    &-title {
      font-size: 30px;
      padding: 32px 0;
    }

    .login-more-option {
      margin-top: 16px;
      display: flex;
      align-items: center;
      font-size: 13px;

      i {
        margin-right: 10px;
        cursor: pointer;
      }
    }

    .icon-yanzhengma::before {
      font-size: 14px;
    }
  }

  .background-area {
    position: absolute;
    top: -96vh;
    left: -46vw;
    width: 100vw;
    height: 200vh;
    background-color: #2d96f1;
    // background-color: #96a1c1;
    border-radius: 50%;
  }

  .login-btn {
    // min-width: 120px;
    width: 100%;
    margin-top: 16px;
  }

  .copyright {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, -50%);

    a {
      color: #666666;
    }
  }
}
</style>
