<template>
  <div class="app-menu">
    <el-menu @select="handleSkipRouter" :collapse="collapsed" :default-active="route.path">
      <!-- 菜单权限 -->
      <MenuItem v-for="(model, index) in menus" :model="model" :key="index"></MenuItem>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import MenuItem from "./MenuItem.vue";
const store = useStore();
const router = useRouter();
const route = useRoute();
const menus = computed(() => {
  console.log('>>>>>store.state.user.menus', store.state.user.menus);
  return store.state.user.menus;
});
const collapsed = computed(() => {
  return store.state.app.collapsed;
});

const handleSkipRouter = (index) => {
  router.push({ path: index });
};
</script>
<style scoped lang="scss">
.app-menu {
  height: 100%;

  .el-menu:not(.el-menu--collapse) {
    width: 200px;
    overflow: hidden;
    height: 100%;
  }

  ::v-deep(.el-menu--collapse) {

    .el-sub-menu__icon-arrow,
    span {
      display: none;
    }

    // ::v-deep(.el-sub-menu__icon-arrow) {
    //   display: none;
    // }
  }
}
</style>
