<template>
  <div>
    <el-sub-menu
      v-if="hasChild"
      :index="props.model.router || props.model.name"
    >
      <template #title>
        <!-- 动态组件-调用element-plus图标组件 -->
        <el-icon>
          <component :is="props.model.icon"></component>
        </el-icon>
        <span>{{ props.model.name }}</span>
      </template>
      <!-- 递归菜单组件-调用自己，必须name:MenuItem -->
      <MenuItem
        v-for="(item, index) in props.model.children"
        :key="index"
        :model="item"
      ></MenuItem>
    </el-sub-menu>
    <el-menu-item v-else :index="props.model.router || ''">
      <el-icon>
        <component :is="props.model.icon"></component>
      </el-icon>
      <span>{{ props.model.name }}</span>
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
  name: "MenuItem",
});
const props = defineProps({
  model: {
    tyep: Object,
    default: () => [],
  },
});
const hasChild = computed(() => {
  return props.model.children && props.model.children.length > 0;
});
</script>
<style scoped lang="scss"></style>
