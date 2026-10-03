<template>
  <div>
    <div style="display: flex">
      <label>起点：<el-input v-model.trim="startText"></el-input></label>
      <label>终点：<el-input v-model.trim="endText"></el-input></label>
    </div>

    <el-button type="primary" @click="handlePlanLine">规划路线</el-button>
    <el-button type="primary" @click="handlePlanLineFree"
      >规划路线免去经纬度解密，直接获取经纬度</el-button
    >
    <el-button type="primary" @click="handleShowPoint"
      >自适应，让地图显示所有的动态标记点</el-button
    >
    <div class="map-area" ref="mapRef"></div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import iconMarker from "@/assets/image/position.png";
import axios from "axios";
import { ElMessage } from "element-plus";
const mapRef = ref(null);
// TODO 记录错误，代理对象，不能使用ref定义map实例和markerPoint标记实例，影响使用某些api，比如moveAlong移动
var map = null; // 全局存储地图实例，防止重复创建
var markerPoint = null;
var playLine = null;
const startText = ref("江西省上饶市广信区铁山乡九狮畲族村黄家弄");
const endText = ref("江西省上饶市广信区铁山乡大溪村");
const start0 = ref(22.652943);
const start1 = ref(114.197502);
const end0 = ref(22.652557);
const end1 = ref(114.195257);
// 初始化地图函数
const initMap = () => {
  // 双重判断：dom存在 + TMap全局对象存在
  if (!mapRef.value || !window.TMap) return;
  // 避免重复初始化地图
  if (map) return;
  map = new window.TMap.Map(mapRef.value, {
    center: new TMap.LatLng(22.652687, 114.198158), //地图显示中心点
    zoom: 18, //缩放级别
  });
  playLine = new TMap.MultiPolyline({
    id: "player",
    map: map,
    styles: {
      style_blue: new TMap.PolylineStyle({
        color: "#3777FF", //线填充色
        width: 6, //折线宽度
        borderWidth: 5, //边线宽度
        borderColor: "#FFF", //边线颜色
        lineCap: "butt", //线端头方式
      }),
      style_red: new TMap.PolylineStyle({
        color: "#CC0000", //线填充色
        width: 6, //折线宽度
        borderWidth: 5, //边线宽度
        borderColor: "#CCC", //边线颜色
        lineCap: "round", //线端头方式
      }),
    },
    //折线数据定义
    geometries: [
      {
        //第1条线
        id: "pl_1", //折线唯一标识，删除时使用
        styleId: "style_blue", //绑定样式名
        paths: [
          new TMap.LatLng(40.03854, 116.272389),
          new TMap.LatLng(40.038844, 116.27521),
          new TMap.LatLng(40.041407, 116.274738),
        ],
      },
      {
        //第2条线
        id: "pl_2",
        styleId: "style_red",
        paths: [
          new TMap.LatLng(40.039492, 116.271893),
          new TMap.LatLng(40.041562, 116.271421),
          new TMap.LatLng(40.041957, 116.274211),
        ],
      },
    ],
  });
  map.on("click", (event) => {
    console.log(">>>>>event点击事件", event);
    handlePoint([event.latLng.lat, event.latLng.lng]);
  });
};
// 地图标记 https://lbs.qq.com/webApi/javascriptGL/glDoc/glDocMarker
const handlePoint = (position) => {
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
        position: new window.TMap.LatLng(position[0], position[1]),
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
/**
 * 免去经纬度解密
 * @param start 起点
 * @param end 终点
 */
const handleCountLineFree = async (start, end) => {
  var driving = new TMap.service.Driving({
    // 新建一个驾车路线规划类
    mp: false, // 是否返回多方案
    policy: "PICKUP,NAV_POINT_FIRST", // 规划策略
  });
  driving.search({ from: startPosition, to: endPosition }).then((result) => {
    console.log(">>>>result>", result);
    let paths = [];
    if (result.data.status == 0) {
      paths = result.data.result.routes[0].polyline;
      playLine.add([
        {
          styleId: "myStyle",
          paths,
        },
      ]);
      fit(paths);
    } else {
      ElMessage.error(result.data.message);
    }
  });
};
/**
 *
 * @param start 起点
 * @param end 终点
 */
const handleCountLine = async (start, end) => {
  // https://apis.map.qq.com/ws/direction/v1/walking/?from=39.984042,116.307535&to=39.976249,116.316569&key=[你的key]
  const res = await axios.get("/ws/direction/v1/walking", {
    params: {
      from: `${start[0]},${start[1]}`, // 起点坐标 维度,经度
      to: `${end[0]},${end[1]}`,
      key: import.meta.env.VITE_MAP_KEY,
    },
  });
  let playLineArr = [];
  let paths = [];
  if (res.data.status == 0) {
    playLineArr = res.data.result.routes[0].polyline;
    for (var i = 2; i < playLineArr.length; i++) {
      playLineArr[i] = playLineArr[i - 2] + playLineArr[i] / 1000000;
    }
    const result = [];
    for (let i = 0; i < playLineArr.length; i += 2) {
      result.push([playLineArr[i], playLineArr[i + 1]]);
    }
    console.log(">>playLineArr>>>", playLineArr);
    paths = result.map((item) => new TMap.LatLng(item[0], item[1]));
    // 创建 MultiPolyline显示路径折线
    // var polylineLayer = new TMap.MultiPolyline({
    //   id: "polyline-layer",
    //   map: map,
    //   styles: {
    //     style_blue: new TMap.PolylineStyle({
    //       color: "#3777FF",
    //       width: 8,
    //       borderWidth: 5,
    //       borderColor: "#FFF",
    //       lineCap: "round",
    //     }),
    //   },
    //   geometries: [
    //     {
    //       id: "pl_1",
    //       styleId: "style_blue",
    //       paths: playLine,
    //     },
    //   ],
    // });
  } else {
    ElMessage.error(res.data.message);
  }
  playLine.add([
    {
      styleId: "myStyle",
      paths,
    },
  ]);
  fit(paths);
  // markerPoint.moveAlong({
  //   car1: {
  //     // 标记名称
  //     path: [
  //       new TMap.LatLng(22.651924, 114.196352),
  //       new TMap.LatLng(22.651862, 114.197257),
  //       new TMap.LatLng(22.653335, 114.198173),
  //       new TMap.LatLng(22.652999, 114.198631),
  //       new TMap.LatLng(22.653236, 114.197693),
  //     ],
  //     speed: 250,
  //   },
  // });
};
/**
 *
 * @param start 起点
 * @param end 终点
 */
const handleLine = (start, end) => {
  let paths = [
    new TMap.LatLng(start[0], start[1]),
    new TMap.LatLng(end[0], end[1]),
  ];
  console.log(">>>>>paths", paths);
  playLine.add([
    {
      styleId: "myStyle",
      paths,
    },
  ]);
  fit(paths);
  // markerPoint.moveAlong({
  //   car1: {
  //     // 标记名称
  //     path: [
  //       new TMap.LatLng(22.651924, 114.196352),
  //       new TMap.LatLng(22.651862, 114.197257),
  //       new TMap.LatLng(22.653335, 114.198173),
  //       new TMap.LatLng(22.652999, 114.198631),
  //       new TMap.LatLng(22.653236, 114.197693),
  //     ],
  //     speed: 250,
  //   },
  // });
};
/**
 *
 * @param markers [LatLng,LatLng]
 */
const fit = (markers) => {
  const bounds = new TMap.LatLngBounds();
  markers.forEach((item) => {
    if (bounds.isEmpty() || !bounds.contains(item)) {
      bounds.extend(item);
    }
  });
  map.fitBounds(bounds, {
    padding: 100,
  });
};
const handleResolvePosition = async (
  address = "广东省深圳市龙岗区四联路244号",
) => {
  const res = await axios.get("/ws/geocoder/v1", {
    params: {
      key: import.meta.env.VITE_MAP_KEY,
      address,
    },
  });
  if (res.status == 200) {
    if (res.data.status == 121) {
      return ElMessage.error(res.data.message);
    }
    return [res.data.result.location.lat, res.data.result.location.lng];
  }
  return null;
};
// 免去解密
const handlePlanLineFree = async () => {
  const startPosition = await handleResolvePosition(startText.value);
  const endPosition = await handleResolvePosition(endText.value);
  handlePoint(startPosition);
  handlePoint(endPosition);
  // console.log(">>>>startPosition>", startPosition);
  // console.log(">>>>endPosition>", endPosition);
  handleCountLine(startPosition, endPosition);
};
const handlePlanLine = async () => {
  const startPosition = await handleResolvePosition(startText.value);
  const endPosition = await handleResolvePosition(endText.value);
  handlePoint(startPosition);
  handlePoint(endPosition);
  // console.log(">>>>startPosition>", startPosition);
  // console.log(">>>>endPosition>", endPosition);
  handleCountLine(startPosition, endPosition);
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
  // script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${import.meta.env.VITE_MAP_KEY}`;
  // 可免去获取路径规划经纬度数组解密,直接获取经纬度
  script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${import.meta.env.VITE_MAP_KEY}&libraries=service`;
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
onUnmounted(() => {
  map.destroy();
});
</script>
<style scoped lang="scss">
.map-area {
  width: 1000px;
  height: 400px;
  border: 2px solid #ccc;
}
</style>
