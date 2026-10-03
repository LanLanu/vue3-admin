<template>
  <div class="app-header">
    <div class="app-header__left">
      <div class="collase-area" @click="handleCollapse(!collapsed)">
        <el-icon>
          <Expand v-if="collapsed" />
          <Fold v-else />
        </el-icon>
      </div>
      <el-breadcrumb style="margin-top: 2px" separator="/">
        <!-- <el-breadcrumb-item :to="{ path: '/' }">工作台</el-breadcrumb-item>
        <el-breadcrumb-item> 组件库 </el-breadcrumb-item> -->
        <el-breadcrumb-item v-for="(item, index) in breadList" :key="index">{{
          item
        }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="app-header__right">
      <div class="phone-area">
        <el-tooltip content="Bottom center" placement="bottom" effect="light">
          <template #content>
            <div>
              <div style="margin-bottom: 2px; text-align: center">
                应用篮APP
              </div>
              <!-- <Vue3NextQrcode
                text="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode"
              /> -->
              <!-- text="https://bluecp.xyz/download/blueapp.apk" -->
              <Vue3NextQrcode
                text="https://bluecp.xyz/download/blueapp.apk"
                :size="100"
                :margin="0"
              />
            </div>
          </template>
          <el-icon color="#60666f" class="no-inherit">
            <Iphone />
          </el-icon>
        </el-tooltip>
      </div>
      <el-dropdown trigger="click" style="cursor: pointer">
        <div style="display: flex">
          <p>{{ info.nickName }}</p>
          <img class="avatar" :src="info.headImg" alt="" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="Plus" @click="handleTip">{{
              info.username
            }}</el-dropdown-item>
            <el-dropdown-item icon="User" @click="handleTip"
              >个人中心</el-dropdown-item
            >
            <!-- <el-dropdown-item icon="SwitchButton">退出登录</el-dropdown-item> -->
            <el-dropdown-item @click="handleLoginOut"
              ><i class="iconfont icon-tuichu"></i>退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useAppStore } from "@/store/modules/app";
import { getMenuList } from "@/api/menu";
import { useUserStore } from "@/store/modules/user";
import { Vue3NextQrcode } from "vue3-next-qrcode";
import "vue3-next-qrcode/es/style.css";
const user = useUserStore();
const app = useAppStore();
defineOptions({
  name: "app-header",
});
const handleTip = () => {
  ElMessage.warning("功能迭代开发中~");
};
const breadList = ref([]);
const router = useRouter();
const menusList = ref([]);
const route = useRoute();
const getErweima = () => {};
onMounted(async () => {
  getErweima();
  const res = await getMenuList();
  menusList.value = res.data.filter((item) => item.type != 2);
  console.log(">>>route>>", menusList.value);
  const obj = menusList.value.find((item) => item.router == route.path);
  if (obj) {
    if (obj.parentName) breadList.value.push(obj.parentName);
    breadList.value.push(obj.name);
  }
});
const store = useStore();
const info = computed(() => {
  return user.info;
});
const collapsed = computed(() => {
  return app.collapsed;
});
const handleLoginOut = async () => {
  user.logout();
  ElMessage.success("退出成功");
};
const handleCollapse = async (flag) => {
  app.changeCollpased(flag);
};
watch(
  () => route,
  async (val) => {
    breadList.value = [];
    nextTick(() => {
      const obj = menusList.value.find((item) => item.router == val.path);
      if (obj) {
        if (obj.parentName) breadList.value.push(obj.parentName);
        breadList.value.push(obj.name);
      }
    });
  },
  { deep: true },
);
</script>
<style scoped lang="scss">
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
  box-sizing: border-box;

  .app-header__left {
    display: flex;

    .collase-area {
      margin-right: 4px;
      font-size: 18px;
      cursor: pointer;
      box-sizing: border-box;
    }
  }

  .app-header__right {
    display: flex;
    align-items: center;
    .phone-area {
      display: flex;
      align-items: center;
      margin-right: 20px;
      font-size: 15px;
      color: #60666f;
      cursor: pointer;
      .no-inherit {
        font-size: 18px;
      }
    }
    p {
      margin-right: 10px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
}
</style>
