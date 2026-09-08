<template>
  <div>
    <h2>地图</h2>
    <el-button type="primary" @click="handlePoint">打点</el-button>
    <el-button type="primary" @click="handleMove">移动</el-button>
    <el-button type="primary" @click="handleShowPoint"
      >自适应，让地图显示所以的动态标记点</el-button
    >
    <div class="map-area" ref="mapRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import iconMarker from "@/assets/image/position.png";
const mapRef = ref(null);
// TODO 记录错误，代理对象，不能使用ref定义map实例和markerPoint标记实例，影响使用某些api，比如moveAlong移动
var map = null; // 全局存储地图实例，防止重复创建
var markerPoint = null;
// 初始化地图函数
const initMap = () => {
  // 双重判断：dom存在 + TMap全局对象存在
  if (!mapRef.value || !window.TMap) return;
  // 避免重复初始化地图
  if (map) return;

  const center = new window.TMap.LatLng(22.651924, 114.196352);
  map = new window.TMap.Map(mapRef.value, {
    center: center, // 设置地图中心点坐标，
    zoom: 17, // 设置地图缩放
    pitch: 0, // 俯仰度
    rotation: 0, // 旋转角度
  });
  markerPoint = new TMap.MultiMarker({
    map: map,
    styles: {
      // 点标记样式
      marker: new TMap.MarkerStyle({
        width: 20, // 样式宽
        height: 30, // 样式高
        anchor: { x: 10, y: 30 }, // 描点位置
      }),
      //创建一个styleId为"myStyle"的样式（styles的子属性名即为styleId）
      myStyle: new TMap.MarkerStyle({
        width: 20, // 点标记样式宽度（像素）
        height: 20, // 点标记样式高度（像素）
        src: iconMarker, //图片路径
        //焦点在图片中的像素位置，一般大头针类似形式的图片以针尖位置做为焦点，圆形点以圆心位置为焦点
        anchor: { x: 16, y: 32 },
      }),
    },
    geometries: [
      // 点标记数据数组
      {
        // 标记位置(纬度，经度，高度)
        id: "car1",
        position: center,
      },
      {
        // 标记位置(纬度，经度，高度)
        position: new window.TMap.LatLng(22.652419, 114.198415),
        id: "car2",
        styleId: "myStyle",
      },
      {
        // 标记位置(纬度，经度，高度)
        position: new window.TMap.LatLng(22.652388, 114.197492),
        id: "car3",
        styleId: "myStyle",
      },
    ],
  });
};
// 地图标记 https://lbs.qq.com/webApi/javascriptGL/glDoc/glDocMarker
const handlePoint = () => {
  let tempMarker = new TMap.MultiMarker({
    // map: map,
    styles: {
      // 点标记样式
      marker: new TMap.MarkerStyle({
        width: 20, // 样式宽
        height: 30, // 样式高
        anchor: { x: 10, y: 30 }, // 描点位置
      }),
      //创建一个styleId为"myStyle"的样式（styles的子属性名即为styleId）
      myStyle: new TMap.MarkerStyle({
        width: 20, // 点标记样式宽度（像素）
        height: 20, // 点标记样式高度（像素）
        src: iconMarker, //图片路径
        //焦点在图片中的像素位置，一般大头针类似形式的图片以针尖位置做为焦点，圆形点以圆心位置为焦点
        anchor: { x: 16, y: 32 },
      }),
    },
    geometries: [
      {
        // 标记位置(纬度，经度，高度)
        position: new window.TMap.LatLng(22.652, 114.197497),
        id: "car4",
        styleId: "myStyle",
      },
    ],
  });
  tempMarker.setMap(map);
};
const handleShowPoint = () => {
  let tempMarker = new TMap.MultiMarker({
    // map: map,
    styles: {
      // 点标记样式
      marker: new TMap.MarkerStyle({
        width: 20, // 样式宽
        height: 30, // 样式高
        anchor: { x: 10, y: 30 }, // 描点位置
      }),
      //创建一个styleId为"myStyle"的样式（styles的子属性名即为styleId）
      myStyle: new TMap.MarkerStyle({
        width: 20, // 点标记样式宽度（像素）
        height: 20, // 点标记样式高度（像素）
        src: iconMarker, //图片路径
        //焦点在图片中的像素位置，一般大头针类似形式的图片以针尖位置做为焦点，圆形点以圆心位置为焦点
        anchor: { x: 16, y: 32 },
      }),
    },
    geometries: [
      {
        // 标记位置(纬度，经度，高度)
        position: new window.TMap.LatLng(22.654475, 114.193936),
        id: "car5",
        styleId: "myStyle",
      },
      {
        // 标记位置(纬度，经度，高度)
        position: new window.TMap.LatLng(22.656583, 114.198796),
        id: "car6",
        styleId: "myStyle",
      },
    ],
  });
  tempMarker.setMap(map);
  const bounds = new TMap.LatLngBounds();
  bounds.extend(new TMap.LatLng(22.654475, 114.193936));
  bounds.extend(new TMap.LatLng(22.656583, 114.198796));
  map.fitBounds(bounds, {
    padding: 100,
  });
};
const handleMove = () => {
  markerPoint.moveAlong({
    car1: {
      // 标记名称
      path: [
        new TMap.LatLng(22.651924, 114.196352),
        new TMap.LatLng(22.651862, 114.197257),
        new TMap.LatLng(22.653335, 114.198173),
        new TMap.LatLng(22.652999, 114.198631),
        new TMap.LatLng(22.653236, 114.197693),
      ],
      speed: 250,
    },
  });
};
// 加载地图JS，加载完成后再初始化
const loadMap = () => {
  // 如果已经加载过脚本直接初始化
  if (window.TMap) {
    initMap();
    return;
  }

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${import.meta.env.VITE_MAP_KEY}`;
  // 脚本加载完成回调
  script.onload = () => {
    initMap();
  };
  // 加载失败捕获
  script.onerror = () => {
    console.error("腾讯地图脚本加载失败，请检查key或网络");
  };
  document.body.appendChild(script);
};

onMounted(() => {
  loadMap();
});
</script>
<style scoped lang="scss">
.map-area {
  width: 1000px;
  height: 400px;
  border: 2px solid #ccc;
}
</style>
