<template>
  <div :class="{ 'large-screen': true, 'blur-bg': blurBgFlag }">
    <!-- blur-bg 高斯模糊 -->
    <div :class="{ qifbwdwqdiqu: true, 'bg-blur': blurAllFlag }">
      <topTab
        :currentCrew="currentCrew"
        @backMenu="backMenu"
        @back="handleBack"
      />
    </div>
    <div class="qifbwdwqdiqu2">
      <bothSides
        :fullPosition="fullPosition"
        ref="bothSidesRef"
        @activeCrew="handleActiveCrew"
        @changeBlur="changeBlur"
        @changeCrew="changeCrew"
        :menuNumber="menuNumber"
      />
    </div>
  </div>
</template>

<script scoped>
import topTab from "./com/topTab.vue";
import bothSides from "./com/bothSides.vue";

function getSystemManageEntryPath() {
  // 进入后台管理系统默认打开个人工作台
  return "/workbench";
}

export default {
  components: { topTab, bothSides },
  data() {
    return {
      isFullScreen: true,
      blurBgFlag: false,
      blurAllFlag: false,
      fullPosition: false,
      bgloading: false,
      menuNumber: 0,
      currentCrew: "4号机组",
    };
  },
  computed: {},
  created() {},
  mounted() {
    this.enterFullScreen();
    window.addEventListener("resize", this.checkFullScreen);
  },
  methods: {
    checkFullScreen() {
      const isFull =
        window.innerWidth === screen.width &&
        window.innerHeight === screen.height;
      this.fullPosition = isFull;
      console.log("当前是否全屏：", isFull);
    },
    navigateFromLargeScreen(path) {
      if (this.$route.path === path) {
        return;
      }
      this.$router.push(path).catch((err) => {
        if (
          !err ||
          (err.name !== "NavigationDuplicated" &&
            !/NavigationDuplicated/.test(err.message))
        ) {
          throw err;
        }
      });
    },
    handleBack(flag) {
      const path = flag ? "/my-backlog" : getSystemManageEntryPath();
      this.navigateFromLargeScreen(path);
    },

    enterFullScreen() {
      // this.$nextTick(() => {
      //   const elem = document.documentElement; // 获取根元素
      //   if (elem.requestFullscreen) {
      //     elem.requestFullscreen();
      //   } else if (elem.mozRequestFullScreen) {
      //     // Firefox
      //     elem.mozRequestFullScreen();
      //   } else if (elem.webkitRequestFullscreen) {
      //     // Chrome, Safari and Opera
      //     elem.webkitRequestFullscreen();
      //   } else if (elem.msRequestFullscreen) {
      //     // IE/Edge
      //     elem.msRequestFullscreen();
      //   }
      //   this.isFullScreen = !this.isFullScreen;
      // });
    },
    exitFullScreen() {
      // const elem = document.documentElement; // 获取根元素
      // console.log(">>>>>>退出全屏", elem);
      // if (document.exitFullscreen) {
      //   document.exitFullscreen();
      //   console.log(">>>>>>", 1);
      // } else if (document.mozCancelFullScreen) {
      //   // Firefox
      //   console.log(">>>>>>", 2);
      //   document.mozCancelFullScreen();
      // } else if (document.webkitExitFullscreen) {
      //   // Chrome, Safari and Opera
      //   console.log(">>>>>>", 3);
      //   document.webkitExitFullscreen();
      // } else if (document.msExitFullscreen) {
      //   // IE/Edge
      //   console.log(">>>>>>", 4);
      //   document.msExitFullscreen();
      // }
      // this.isFullScreen = !this.isFullScreen;
      // console.log(">>>>>>", 5);
    },
    toggleFullScreen() {
      if (document.fullscreenElement) {
        console.log("当前在全屏模式");
      } else {
        console.log("不在全屏模式");
      }
      if (!this.isFullScreen) {
        this.enterFullScreen();
      } else {
        this.exitFullScreen();
      }
    },
    backMenu() {
      this.menuNumber++;
    },
    handleActiveCrew(flag) {
      this.blurBgFlag = flag;
    },
    changeBlur(flag) {
      console.log("333", flag);
      this.blurAllFlag = flag;
    },
    changeCrew(crewName) {
      this.currentCrew = crewName;
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkFullScreen);
  },
  watch: {
    isFullScreen(val) {
      if (val) {
        console.log(">>>>>进入全屏11111");
      } else {
        console.log(">>>>>退出全屏2222");
      }
    },
  },
};
</script>

<style scoped lang="less">
@import "./css/utils.less";

.large-screen {
  .px2vw(width, 1920);
  .px2vh(height, 960);
  background-image: url("./img/bgNew1.png");
  background-repeat: no-repeat;
  background-size: cover;
  will-change: background-image;
  background-position: center center;
  image-rendering: -webkit-optimize-contrast;
  transform: translateZ(0);
  /* 硬件加速 */
  filter: brightness(1);
}

.bgImg {
  .px2vw(width, 1920);
  .px2vh(height, 960);
  // background-image: url("./img/largeScreenBckZip.png");
  background-repeat: no-repeat;
  background-size: cover;
  will-change: background-image;
  background-position: center center;
  image-rendering: -webkit-optimize-contrast;
  transform: translateZ(0);
  /* 硬件加速 */
  filter: brightness(1);
  // background-color: saddlebrown;
}

.bg-blur {
  filter: blur(3px);
}

.qifbwdwqdiqu {
  width: 100vw;
  height: 14%;
  height: 14vh;
  position: relative;
  // z-index: 20;
  pointer-events: auto;
}

.qifbwdwqdiqu2 {
  width: 100vw;
  height: 86vh;
}

// 高斯模糊
.blur-bg {
  position: relative;
  z-index: 1;
}

.blur-bg::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  /* 继承父级背景图 */
  filter: blur(3px);
  /* 模糊强度，可改 5px/10px/15px */
  z-index: -1;
  /* 放在内容下面 */
  transform: scale(1);
  /* 消除边缘白边（关键） */
  /* 👇 核心：添加均匀暗色，不是暗角 */
  background-color: rgba(0, 0, 0, 0.6) !important;
  background-blend-mode: darken;
}
</style>
