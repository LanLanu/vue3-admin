<template>
    <div class="custom-directive">
        <h2>自定义指令</h2>
        <input type="text" v-my-directive>
        <h2>水印</h2>
        <div v-waterMarker="'您好啊'" style="width: 500px;height: 300px;background-color: antiquewhite;"></div>
        <h2>拖拽</h2>
        <!-- vue3新增的传送门组件 -->
        <Teleport to="#app">
            <div v-draggable class="box"></div>
        </Teleport>
        <div class="drag">
            <div v-draggable class="box"></div>
        </div>
    </div>
</template>

<script setup>
import { Teleport } from "vue";
import myDirective from "../../directives/modules/focus.js";
const vMyDirective = myDirective;
</script>
<style scoped lang='scss'>
.custom-directive {
    height: 100%;
}

.drag {
    position: relative;
    width: 500px;
    height: 300px;
    background-color: antiquewhite;

    .box {
        width: 50px;
        height: 50px;
        background-color: azure;
    }
}
</style>