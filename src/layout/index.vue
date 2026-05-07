<template>
  <div class="app-layout">
    <div class="app-layout__left">
      <appMenu></appMenu>
    </div>
    <div class="app-layout__right">
      <div class="app-layout__top">
        <appHeader></appHeader>
      </div>
      <div class="app-layout__container">
        <RouterView />
      </div>
    </div>
  </div>
  <hr />
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import appHeader from "./components/app-header.vue";
import appMenu from "./components/app-menu.vue";
</script>
<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100%;
  background-color: cadetblue;
  .app-layout__left {
    width: 200px;
    background-color: chocolate;
  }
  .app-layout__right {
    flex: 1;
    background-color: aquamarine;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .app-layout__top {
      height: 64px;
      background-color: red;
    }
    .app-layout__container {
      flex: 1;
      background-color: forestgreen;
    }
  }
  h1 {
  }
}
hr {
}
</style>
