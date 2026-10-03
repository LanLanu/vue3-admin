<!-- 激活机组 -->
<template>
  <div class="active-crew-group">
    <div class="active-crew-group-header">
      <div class="factory-header">厂房</div>
      <div class="stairs-header">楼层</div>
      <div class="room-header">房间</div>
      <div class="system-header">系统</div>
      <div class="rack-header">
        机柜
        <span>选中房间自动编辑所在房间机柜</span>
      </div>
    </div>
    <div class="active-crew-group-content">
      <div class="factory-content">LX</div>
      <div class="stairs-room-content">
        <div class="stairs-area">
          <div
            class="stairs-item"
            v-for="(stair, index) in stairs"
            :key="index"
          >
            <div
              class="stairs-item-title"
              :style="{ height: getTitleHeight(index) }"
            >
              {{ stair }}
            </div>
            <div class="room-list">
              <div
                v-for="(subItem, subIndex) in findRooms(stair)"
                :ref="`itemRef${subItem.id}`"
                :class="getColorClass(subItem)"
                :key="subIndex"
                @mouseenter="handEnter(subItem, subIndex)"
                @mouseleave="handleLeave(subItem, subIndex)"
                @click.stop="handleShowRoomDevice(subItem.title)"
                :style="{ height: getItemHeight(index, subIndex) }"
              >
                {{ subItem.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="system-rack-content">
        <div class="system-area">
          <div
            class="system-item"
            v-for="(system, index) in systems"
            :key="index"
          >
            <div class="system-item-title">{{ system }}</div>
            <div class="rack-list">
              <div
                v-for="(subItem, subIndex) in findRack(system)"
                :ref="`${system}Ref${subIndex}`"
                :class="getColorClassCrew(subItem)"
                :key="subIndex"
                @mouseenter="handEnterCrew(subItem, subIndex, system)"
                @mouseleave="handleLeaveCrew(subItem, subIndex, system)"
                @click.stop="handleShowRoomDevice(subItem.title)"
              >
                {{ subItem.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="status-label">
      <div class="square-area normal-green">
        <div class="square-item green-square"></div>
        <span>监测正常</span>
      </div>
      <div class="square-area warning-yellow">
        <div class="square-item yellow-square"></div>
        <span>监测异常</span>
      </div>
      <div class="square-area error-red">
        <div class="square-item red-square"></div>
        <span>监测报警</span>
      </div>
    </div>
    <roomDeviceWatch ref="roomDeviceWatchRef" @change="handleChange" />
  </div>
</template>
<script scoped>
import roomDeviceWatch from "./roomDeviceWatch.vue";
export default {
  name: "ActiveCrewGroup",
  components: { roomDeviceWatch },
  data() {
    return {
      // 楼层
      stairs: ["24m以上", "20m", "+15m", "+11m", "0m"],
      // stairs: ["24m以上"],
      systems: ["3R", "KCP", "TCS", "KRT"],
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
              { id: "5", title: "KRT（WX）", color: "green" },
            ],
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
              { id: "14", title: "KTR（WX）", color: "green" },
            ],
          },
          { title: "20m", list: [{ id: "16", title: "L749", color: "green" }] },
          {
            title: "24m以上",
            list: [{ id: "17", title: "KTR", color: "green" }],
          },
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
              { title: "4RGLO11AR", color: "green" },
            ],
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
              { title: "4RGLO11AR", color: "green" },
            ],
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
              { title: "4RGLO11AR", color: "green" },
            ],
          },
          {
            title: "KRT",
            list: [
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
              { title: "4RGLO11AR", color: "green" },
            ],
          },
        ],
      },
    };
  },
  methods: {
    getTitleHeight(index) {
      const designWidth = 1920;
      const designHeight = 960;
      if (index == 0) {
        return (
          (36 / designHeight) * ((100 * designHeight) / designWidth) + "vw"
        );
      }
      return "";
    },
    getItemHeight(index, subIndex) {
      const designWidth = 1920;
      const designHeight = 960;
      if (index == 0 && subIndex == 0) {
        return (
          (36 / designHeight) * ((100 * designHeight) / designWidth) + "vw"
        );
      }
      return "";
    },
    findRooms(stair) {
      const obj = this.tempCrewObj.second.find((item) => item.title == stair);
      if (obj) return obj.list;
      return [];
    },
    findRack(system) {
      const obj = this.tempCrewObj.third.find((item) => item.title == system);
      if (obj) return obj.list;
      return [];
    },
    handleChange(flag) {
      console.log("111", flag);
      this.$emit("change", flag);
    },
    handleClose() {
      this.$emit("close");
    },
    handleShowRoomDevice(title) {
      // 房间号
      this.$refs.roomDeviceWatchRef.titleName = title;
      this.$refs.roomDeviceWatchRef.open();
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
      if (!subItem) return { "room-list-item": true };
      return {
        "room-list-item": true,
        "bgColor-green": subItem.color == "green",
        "bgColor-red": subItem.color == "red",
        "bgColor-yellow": subItem.color == "yellow",
      };
    },
    getColorClassCrew(subItem) {
      if (!subItem) return { "rack-list-item": true };
      return {
        "rack-list-item": true,
        "bgColor-crew-green": subItem.color == "green",
        "bgColor-crew-red": subItem.color == "red",
        "bgColor-crew-yellow": subItem.color == "yellow",
      };
    },
  },
};
</script>

<style scoped lang="less">
@import "../css/utils.less";
.active-crew-group {
  position: relative;
  z-index: 1004;
  .px2font(12);
  &-header {
    display: flex;
    .px2vh-vw(height, 34);
    .px2vh-vw(line-height, 34);
    .factory-header {
      .px2vw(width, 40);
      text-align: center;
      .px2vw(margin-right, 6);
      background-color: #133b57;
    }
    .stairs-header {
      .px2vw(width, 60);
      text-align: center;
      .px2vw(margin-right, 6);
      background-color: #133b57;
    }
    .room-header {
      .px2vw(width, 110);
      text-align: center;
      .px2vw(margin-right, 26);
      background-color: #133b57;
    }
    .system-header {
      .px2vw(width, 40);
      text-align: center;
      .px2vw(margin-right, 6);
      background-color: #133b57;
    }
    .rack-header {
      position: relative;
      flex: 1;
      display: flex;
      justify-content: center;
      background-color: #133b57;
      span {
        .px2vw(padding-right, 16);
        position: absolute;
        height: 100%;
        z-index: 1;
        color: #aeb9c1;
        right: 0;
      }
    }
  }
  &-content {
    display: flex;
    .px2vh-vw(margin-top, 6);
    // flex-wrap: wrap;
    .factory-content {
      letter-spacing: 1px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.2);
      .px2vw(width, 40);
      // .px2vh-vw(height, 634);
      .px2font(12);
      .px2vw(margin-right, 6);
    }
    .stairs-room-content {
      .px2vw(margin-right, 26);
      .stairs-area {
        // background-color: antiquewhite;
        .stairs-item {
          display: flex;
          &-title {
            .px2vw(width, 60);
            .px2vh-vw(margin-bottom, 6);
            background-color: rgba(255, 255, 255, 0.2);
            display: flex;
            justify-content: center;
            text-align: center;
            align-items: center;
            .px2font(12);
            .px2vw(margin-right, 6);
          }
          .room-list {
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
          }
        }
      }
    }
    .system-rack-content {
      flex: 1;
      display: flex;
      overflow: hidden;
      .system-area {
        .system-item {
          display: flex;
          &-title {
            .px2vw(width, 40);
            background-color: rgba(255, 255, 255, 0.2);
            display: flex;
            justify-content: center;
            align-items: center;
            .px2vw(margin-right, 6);
            overflow: hidden;
            .px2vh-vw(margin-bottom, 16);
          }
          &-title:last-child {
            .px2vh-vw(margin-bottom, 0);
          }
          .rack-list {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            .rack-list-item {
              overflow: hidden;
              .px2vw(width, 136);
              .px2vh-vw(height, 34);
              .px2vw(padding-left, 36);
              box-sizing: border-box;
              .px2vh-vw(line-height, 34);
              cursor: pointer;
              // margin-right: 6px;
              .px2vw(margin-right, 6);
              .px2vh-vw(margin-bottom, 6);
              .px2font(12);
            }
            .rack-list-item:last-child {
              .px2vh-vw(margin-bottom, 16);
            }
          }
        }
      }
    }
  }
  .status-label {
    position: absolute;
    .px2vh-vw(bottom, -70);
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 1;
    display: flex;
    .square-area {
      display: flex;
      align-items: center;
      .px2vw(margin-right, 30);
      span {
        .px2vw(margin-left, 10);
      }
    }
    .square-item {
      .px2vw(width, 12);
      .px2vh-vw(height, 12);
    }
    .green-square {
      background-color: #00ff11;
    }
    .yellow-square {
      background-color: #ffa600;
    }
    .red-square {
      background-color: #ff0000;
    }
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
</style>
