<template>
  <div>
    <el-button @click="handleCheck">获取选中</el-button>
    <el-button type="primary" @click="check">设置选中1,2,3</el-button>
    <el-button type="success">Success</el-button>
    <el-button type="info">Info</el-button>
    <el-button type="warning">Warning</el-button>
    <el-button type="danger">Danger</el-button>
    <menu-check ref="menuCheckRef" />
    <RoleSelect v-model="checkRole" ref="RoleSelectRef" />
    {{ checkIds }}
  </div>
</template>

<script setup>
import MenuCheck from "@/components/menu-check/index.vue";
import RoleSelect from "@/components/role-select/index.vue";
import { ref } from "vue";
const checkIds = ref([]);
const checkRole = ref([]);
const menuCheckRef = ref(ref);
const handleCheck = () => {
  checkIds.value = menuCheckRef.value.get();
};
const check = () => {
  menuCheckRef.value.set([1, 2, 3]);
};
</script>
<style scoped lang="scss"></style>
