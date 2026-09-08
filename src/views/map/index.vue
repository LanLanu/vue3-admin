<template>
  <div>
    <h2>地图</h2>
    <div class="map-area" ref="mapRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const mapRef = ref(null);
const initMap = () => {
  //定义地图中心点坐标
  var center = new TMap.LatLng(39.98412, 116.307484);
  //定义map变量，调用 TMap.Map() 构造函数创建地图
  var map = new TMap.Map(mapRef.value, {
    center: center, //设置地图中心点坐标
    zoom: 17.2, //设置地图缩放级别
  });
};
const loadMap = () => {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://map.qq.com/api/gljs?v=1.exp&key=V2TBZ-NF5KZ-XHSXT-TUUTW-J5WIV-6KBZR";
  document.body.appendChild(script);
};
onMounted(() => {
  loadMap();

  initMap();
});
</script>
<style scoped lang="scss">
.map-area {
  width: 600px;
  height: 400px;
}
</style>
