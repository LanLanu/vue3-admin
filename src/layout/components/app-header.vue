<template>
  <div class="app-header">
    <div class="app-header__left">22</div>
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
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
defineOptions({
  name: "app-header",
});
const router = useRouter();
const store = useStore();
const info = computed(() => {
  console.log(">>>>>store.state.user.info", store.state.user.info);
  return store.state.user.info;
});
const handleLoginOut = async () => {
  await store.dispatch("user/logout");
  localStorage.clear();
  router.replace("/login");
};
</script>
<style scoped lang="scss">
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
  .app-header__left {
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
