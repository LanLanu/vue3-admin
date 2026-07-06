<template>
  <div>
    监控页
    <el-button type="warning" @click="handleAll">并发</el-button>
    <el-button type="warning" @click="handleRefresh">刷新token</el-button>
    <el-button type="warning" @click="handlePost">发生获取角色请求</el-button>
  </div>
</template>

<script setup>
import { getRoleList, getRolePage } from "@/api/role";
import { refreshToken } from "@/api/user";
import { setToken } from "@/utils/index";
const handlePost = async () => {
  const res = await getRoleList();
};
const handleRefresh = async () => {
  const res = await refreshToken();
  console.log(">>>>>res", res);
  setToken(res.data.token);
};
const handleAll = async () => {
  Promise.all([getRoleList(), getRolePage()]);
};
</script>
<style scoped lang="scss"></style>
