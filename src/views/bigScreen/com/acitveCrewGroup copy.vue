<!-- 激活机组 -->
<template>
  <div class="crew-table-area">
    <div class="aaa"></div>
    <!-- <span class="crew-table-area-close" @click="handleClose">×</span> -->
    <div class="first-col-area">{{ tempCrewObj.title }}</div>
    <div class="second-col-area">
      <div
        class="second-col-area-content"
        v-for="(item, index) in tempCrewObj.second"
        :key="index"
      >
        <div class="second-col-area-content-title">{{ item.title }}</div>
        <div class="second-col-area-content-list">
          <div
            v-for="(subItem, subIndex) in item.list"
            :ref="`itemRef${subItem.id}`"
            :class="getColorClass(subItem)"
            :key="subIndex"
            @mouseenter="handEnter(subItem, subIndex)"
            @mouseleave="handleLeave(subItem, subIndex)"
            @click.stop="handleShowRoom(subItem.title)"
          >
            {{ subItem.title }}
          </div>
        </div>
      </div>
    </div>
    <div class="third-col-area">
      <div
        class="third-col-area-content"
        v-for="(item, index) in tempCrewObj.third"
        :key="index"
      >
        <div class="third-col-area-content-title">{{ item.title }}</div>
        <div class="third-col-area-content-list">
          <div
            v-for="(subItem, subIndex) in item.list"
            :ref="`${item.title}Ref${subIndex}`"
            :class="getColorClassCrew(subItem)"
            :key="subIndex"
            @mouseenter="handEnterCrew(subItem, subIndex, item.title)"
            @mouseleave="handleLeaveCrew(subItem, subIndex, item.title)"
            @click.stop="handleShowDevice(subItem.title)"
          >
            {{ subItem.title }}
          </div>
        </div>
      </div>
    </div>
    <RoomWatch ref="roomWatchRef" @change="handleChange" />
    <DeviceWatch ref="deviceWatchRef" @change="handleChange" />
  </div>
</template>
<script scoped>
import RoomWatch from "./roomWatch.vue";
import DeviceWatch from "./deviceWatch.vue";
export default {
  name: "ActiveCrewGroup",
  components: { RoomWatch, DeviceWatch },
  data() {
    return {
      tempCrewObj: {
        title: "LX",
        second: [
          { title: "0m", list: [{ title: "W268", color: "green" }] },
          {
            title: "+11m",
            list: [
              { id: "1", title: "L511", color: "green" },
              { id: "2", title: "L545", color: "green" },
              { id: "3", title: "L547", color: "green" },
              { id: "4", title: "L519", color: "green" },
              { id: "5", title: "KRT（WX）", color: "green" }
            ]
          },
          {
            id: "6",
            title: "+15m",
            list: [
              { id: "7", title: "W647", color: "red" },
              { id: "8", title: "L649", color: "green" },
              { id: "9", title: "L647", color: "green" },
              { id: "10", title: "W649", color: "green" },
              { id: "11", title: "W643", color: "yellow" },
              { id: "12", title: "W642", color: "green" },
              { id: "13", title: "KTR", color: "green" },
              { id: "14", title: "KTR（WX）", color: "green" }
            ]
          },
          { title: "20m", list: [{ id: "16", title: "L749", color: "green" }] },
          {
            title: "24m以上",
            list: [{ id: "17", title: "KTR", color: "green" }]
          }
        ],
        third: [
          {
            title: "3R",
            list: [
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" }
            ]
          },
          {
            title: "KCP",
            list: [
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "yellow" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "yellow" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" }
            ]
          },
          {
            title: "TCS",
            list: [
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" }
            ]
          },
          {
            title: "KRT",
            list: [
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" }
            ]
          }
        ]
      }
    };
  },
  methods: {
    handleChange(flag) {
      console.log("111", flag);
      this.$emit("change", flag);
    },
    handleClose() {
      this.$emit("close");
    },
    handleShowDevice(title) {
      this.$refs.deviceWatchRef.titleName = title;
      this.$refs.deviceWatchRef.open();
    },
    handleShowRoom(title) {
      this.$refs.roomWatchRef.titleName = title;
      this.$refs.roomWatchRef.open();
    },
    handleLeave(subItem, subIndex) {
      let className = "";
      switch (subItem.color) {
        case "green":
          className = "bgColor-green-active";
          break;
        case "red":
          className = "bgColor-red-active";
          break;
        case "yellow":
          className = "bgColor-yellow-active";
          break;
      }
      const ele = this.$refs[`itemRef${subItem.id}`][0];
      if (ele.classList.contains(className)) {
        ele.classList.remove(className);
      }
    },
    handleLeaveCrew(subItem, subIndex, name) {
      let className = "";
      switch (subItem.color) {
        case "green":
          className = "bgColor-crew-green-active";
          break;
        case "red":
          className = "bgColor-crew-red-active";
          break;
        case "yellow":
          className = "bgColor-crew-yellow-active";
          break;
      }
      const ele = this.$refs[`${name}Ref${subIndex}`][0];
      if (ele.classList.contains(className)) {
        ele.classList.remove(className);
      }
    },
    handEnterCrew(subItem, subIndex, name) {
      let className = "";
      switch (subItem.color) {
        case "green":
          className = "bgColor-crew-green-active";
          break;
        case "red":
          className = "bgColor-crew-red-active";
          break;
        case "yellow":
          className = "bgColor-crew-yellow-active";
          break;
      }
      const ele = this.$refs[`${name}Ref${subIndex}`][0];

      if (!ele.classList.contains(className)) {
        ele.classList.add(className);
      }
    },
    handEnter(subItem, subIndex) {
      let className = "";
      switch (subItem.color) {
        case "green":
          className = "bgColor-green-active";
          break;
        case "red":
          className = "bgColor-red-active";
          break;
        case "yellow":
          className = "bgColor-yellow-active";
          break;
      }
      const ele = this.$refs[`itemRef${subItem.id}`][0];

      if (!ele.classList.contains(className)) {
        ele.classList.add(className);
      }
    },
    getColorClass(subItem) {
      if (!subItem) return { "second-col-area-content-list-item": true };
      return {
        "second-col-area-content-list-item": true,
        "bgColor-green": subItem.color == "green",
        "bgColor-red": subItem.color == "red",
        "bgColor-yellow": subItem.color == "yellow"
      };
    },
    getColorClassCrew(subItem) {
      if (!subItem) return { "third-col-area-content-list-item": true };
      return {
        "third-col-area-content-list-item": true,
        "bgColor-crew-green": subItem.color == "green",
        "bgColor-crew-red": subItem.color == "red",
        "bgColor-crew-yellow": subItem.color == "yellow"
      };
    }
  }
};
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

// 1.准备数据
const rawData = [
  { name: "系列1", data: [20, 40, 15] },
  { name: "系列2", data: [30, 10, 35] },
  { name: "系列3", data: [12, 28, 42] }
];

const nameColorMap = {};
const series = rawData.map(item => {
  const color = getRandomColor();
  nameColorMap[item.name] = color;
  return {
    name: item.name,
    type: "line",
    smooth: true,
    data: item.data,
    lineStyle: { color },
    itemStyle: { color } // 图例圆圈颜色
  };
});

const option = {
  legend: {
    icon: "circle",
    itemWidth: 10, // 圆圈宽度
    itemHeight: 10, // 圆圈高度
    textStyle: {
      fontSize: 13 // 文字大小
    },
    formatter: function(name) {
      const color = nameColorMap[name];
      // 富文本标签
      return `{label|${name}}`;
    },
    textStyle: {
      rich: {}
    }
  },
  xAxis: {
    type: "category",
    data: ["周一", "周二", "周三"]
  },
  yAxis: {},
  series
};

// ✅ 关键：渲染前动态填充rich颜色
option.legend.textStyle.rich = {};
Object.keys(nameColorMap).forEach(name => {
  option.legend.textStyle.rich.label = {
    color: nameColorMap[name]
  };
});
</script>

<style scoped lang="less">
@import "../css/utils.less";

.crew-table-area {
  width: 100%;
  display: flex;
  position: relative;

  // .aaa {

  //   background-color: red;
  //   position: absolute;
  //   z-index: 22;
  // }

  &-close {
    position: absolute;
    z-index: 7;
    .px2vh-vw(top, -50);
    .px2vw(right, 10);
    .px2font(38);
    cursor: pointer;
    color: #ccc;
    transition: color 0.3s;

    &:hover {
      color: #333;
    }
  }

  .first-col-area {
    letter-spacing: 1px;
    .px2padding(0, 14);
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.2);
    .px2vh-vw(height, 634);
    .px2font(12);
    .px2vw(margin-right, 6);
  }

  .second-col-area {
    // width: 180px;
    height: 100%;
    .px2font(12);
    // letter-spacing: 1px;
    .px2vw(margin-right, 16);

    &-content {
      // margin-bottom: 6px;
      .px2vh-vw(margin-bottom, 6);
      display: flex;
      overflow: hidden;

      &-title {
        .px2vw(width, 60);
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        .px2font(12);
        .px2vw(margin-right, 6);
      }

      &-list {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        &-item {
          .px2vw(width, 110);
          .px2vh-vw(height, 33);
          text-align: center;
          .px2vh-vw(line-height, 33);
          .px2vh-vw(margin-bottom, 6);
          cursor: pointer;
          overflow: hidden;
        }

        &-item:last-child {
          margin-bottom: 0;
        }
      }

      .bgColor-green {
        background-image: url("../img/green.png");
        background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-red {
        background-image: url("../img/red.png");
        background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-yellow {
        background-image: url("../img/yellow.png");
        background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-green-active {
        background-image: url("../img/greenActive.png");
        // background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-red-active {
        background-image: url("../img/redActive.png");
        // background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-yellow-active {
        background-image: url("../img/yellowAcitve.png");
        // background-repeat: no-repeat;
        background-size: cover;
      }
    }
  }

  .third-col-area {
    height: 100%;
    .px2font(12);
    // letter-spacing: 1px;

    &-content {
      display: flex;
      overflow: hidden;
      .px2vh-vw(margin-bottom, 13);

      &-title {
        .px2vw(width, 60);
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        .px2vw(margin-right, 6);
        overflow: hidden;
        .px2vh-vw(margin-bottom, 6);
      }

      &-title:last-child {
        margin-bottom: 0;
        color: red;
      }

      &-list {
        flex: 1;
        display: flex;
        flex-wrap: wrap;

        &-item {
          overflow: hidden;
          .px2vw(width, 132);
          .px2vh-vw(height, 33);
          .px2vw(padding-left, 36);
          box-sizing: border-box;
          .px2vh-vw(line-height, 33);
          cursor: pointer;
          // margin-right: 6px;
          .px2vw(margin-right, 6);
          .px2vh-vw(margin-bottom, 6);
          .px2font(12);
        }

        // &-item:last-child {
        //     margin-bottom: 0px;
        //     color: red;
        // }
      }

      .bgColor-crew-green {
        background-image: url("../img/crewGreen.png");
        background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-crew-red {
        background-image: url("../img/crewRed.png");
        background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-crew-yellow {
        background-image: url("../img/crewYellow.png");
        background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-crew-green-active {
        background-image: url("../img/crewGreenActive.png");
        // background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-crew-red-active {
        background-image: url("../img/crewRedActive.png");
        // background-repeat: no-repeat;
        background-size: cover;
      }

      .bgColor-crew-yellow-active {
        background-image: url("../img/crewYellowActive.png");
        // background-repeat: no-repeat;
        background-size: cover;
      }
    }
  }
}
</style>
