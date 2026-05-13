<template>
  <div>
    <el-sub-menu v-for="menu in menus" :key="menu.id">
      <template #title>
        <!-- <el-icon><location /></el-icon> -->
        <span>{{ menu.name }}</span>
      </template>
      <el-menu-item
        v-for="item in menu.children"
        :index="item.router"
        :key="item.id"
      >
        <!-- <el-icon><setting /></el-icon> -->
        <span>{{ item.name }}</span>
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="4">
      <el-icon><setting /></el-icon>
      <span>Navigator Four</span>
    </el-menu-item>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  getCurrentInstance,
} from "vue";
defineExpose({
  name: "TreeItem",
});
const props = defineProps({
  model: {
    tyep: Object,
    default: () => {},
  },
});
</script>
<style scoped lang="scss"></style>
