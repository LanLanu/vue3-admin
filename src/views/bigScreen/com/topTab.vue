<template>
  <div class="lqwkfbwklndfqow">
    <!-- 光晕底层 -->
    <div class="son-bg"></div>
    <div class="bgimg">火力发电厂房平台</div>
    <div class="qkjebhwjn">
      <div class="top-tab-row">
        <div class="time-header">
          <div class="time-left">
            <div class="time-text">{{ currentTime }}</div>
            <div class="date-text">{{ currentDate }}</div>
          </div>
          <div class="divider"></div>
          <div class="time-right">
            <span class="label-text">当前选择</span>
            <span class="unit-text">{{ currentCrew }}</span>
          </div>
        </div>

        <div class="top-tab-spacer"></div>

        <div class="nav-bar">
          <div class="nav-item home-item" @click.stop="handleClickMenu">
            <img src="../img/homepage.png" />
            <span class="nav-text">首页</span>
          </div>
          <div class="divider"></div>
          <div class="nav-item" @click.stop="handleTodo">
            <img src="../img/todo.png" />
            <span class="nav-text">主控台</span>
          </div>
          <div class="divider"></div>
          <div class="nav-item" @click.stop="handleSystemManage">
            <img src="../img/systemIcon.png" />
            <span class="nav-text">系统管理</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentCrew: {
      type: String,
      default: "1号机组",
    },
  },
  data() {
    return {
      timer: null,
      currentTime: "",
      currentDate: "",
    };
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.updateTime();
    }, 1000);
  },
  methods: {
    handleTodo() {
      this.$router.push("/");
      //
      // this.$emit("back", true);
    },
    handleSystemManage() {
      this.$router.push("/system/menu");
      // this.$emit("back", false);
    },
    handleClickMenu() {
      this.$emit("backMenu");
    },
    updateTime() {
      const now = new Date();
      const h = this.padZero(now.getHours());
      const m = this.padZero(now.getMinutes());
      const s = this.padZero(now.getSeconds());
      this.currentTime = `${h}:${m}:${s}`;
      const y = now.getFullYear();
      const mo = this.padZero(now.getMonth() + 1);
      const d = this.padZero(now.getDate());
      this.currentDate = `${y}.${mo}.${d}`;
    },
    padZero(num) {
      return num < 10 ? `0${num}` : num;
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
};
</script>

<style scoped lang="less">
@import "../css/utils.less";
.lqwkfbwklndfqow {
  width: 100%;
  height: 100%;
  position: relative;
  // background-image: url(../img/aaaa.png);
  background-size: 100% 100%;
  background-clip: border-box;
  .son-bg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 620px;
    height: 80px;
    background: radial-gradient(
      ellipse,
      rgba(60, 170, 255, 0.22) 0%,
      transparent 70%
    );
    filter: blur(12px);
    pointer-events: none;
  }
  .bgimg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    /* 蓝白科技渐变 */
    background: linear-gradient(90deg, #73c8ff, #ffffff, #62d8ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    /* 文字外发光，适配深色大屏 */
    text-shadow:
      0 0 4px rgba(115, 200, 255, 0.6),
      0 0 12px rgba(80, 180, 255, 0.4),
      0 0 24px rgba(40, 140, 255, 0.25);
    letter-spacing: 4px; /* 拉大字间距，大屏科技感 */
    .px2font(40);
  }
}

.qkjebhwjn {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  overflow: visible;

  .top-tab-row {
    .px2heightcalc(60%, 5);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 20;
  }

  .top-tab-spacer {
    flex: 1;
    min-width: 0;
  }

  .time-header {
    width: 19%;
    height: 100%;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    overflow: visible;
    .px2vw(padding-left, 20);
    .px2vw(padding-right, 10);
    padding-top: 1%;
    box-sizing: border-box;

    .time-left {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      .time-text {
        .px2font(18);
        font-weight: bold;
        letter-spacing: 2px;
        color: #ffffff;
        white-space: nowrap;
      }

      .date-text {
        .px2font(14);
        letter-spacing: 1px;
        color: rgba(173, 195, 246, 0.76);
        white-space: nowrap;
      }
    }

    .divider {
      width: 1px;
      height: 70%;
      background-color: #a7a7a7;
      border-radius: 1px;
      margin: 0 4%;
      flex-shrink: 0;
    }

    .time-right {
      flex-shrink: 0;
      white-space: nowrap;
      .label-text {
        .px2font(14);
        letter-spacing: 1px;
        color: rgba(173, 195, 246, 0.76);
        .px2vw(margin-right, 5);
      }

      .unit-text {
        .px2font(18);
        font-weight: bold;
        letter-spacing: 2px;
        color: #ffffff;
      }
    }
  }

  .nav-bar {
    width: 19%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    padding-top: 1%;
    box-sizing: border-box;
    position: relative;
    z-index: 21;
    pointer-events: auto;

    img {
      .px2vw(width, 20);
      .px2vh(height, 20);
      .px2vw(margin-right, 10);
    }

    .home-item img {
      margin-left: 0;
    }

    .divider {
      width: 1px;
      height: 70%;
      background-color: #a7a7a7;
      border-radius: 1px;
      margin: 0 4%;
      flex-shrink: 0;
    }

    .nav-item {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      z-index: 22;
      user-select: none;
      img {
        .px2vw(width, 16);
        .px2vh_vw(height, 16);
      }
    }

    .nav-text {
      .px2font(14);
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.76);
    }
  }
}
</style>
