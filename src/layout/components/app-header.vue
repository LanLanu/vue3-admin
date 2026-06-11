<template>
  <div class="app-header">
    <div class="app-header__left">
      <div class="collase-area" @click="handleCollapse(!collapsed)">
        <el-icon>
          <Expand v-if="collapsed" />
          <Fold v-else />
        </el-icon>
      </div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">工作台</el-breadcrumb-item>
        <el-breadcrumb-item> 组件库 </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="app-header__right">
      <el-dropdown trigger="click">
        <div style="display: flex">
          <p>{{ info.nickName }}</p>
          <img class="avatar" :src="info.headImg" alt="" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="Plus">{{ info.username }}</el-dropdown-item>
            <el-dropdown-item icon="User">个人中心</el-dropdown-item>
            <!-- <el-dropdown-item icon="SwitchButton">退出登录</el-dropdown-item> -->
            <el-dropdown-item @click="handleLoginOut"><i class="iconfont icon-tuichu"></i>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
defineOptions({
  name: "app-header",
});
const router = useRouter();
const route = useRoute();
const store = useStore();
const info = computed(() => {
  console.log('>>>>route>', route);
  return store.state.user.info;
});
const collapsed = computed(() => {
  return store.state.app.collapsed;
});
const handleLoginOut = async () => {
  await store.dispatch("user/logout");
  ElMessage.success("退出成功");
};
const handleCollapse = async (flag) => {
  await store.dispatch("app/changeCollpased", flag);
};
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
      font-size: 18px;
      cursor: pointer;
      box-sizing: border-box;
    }
  }

  .app-header__right {
    display: flex;
    align-items: center;

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
