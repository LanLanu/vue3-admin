<!-- 房间检测弹框 -->
<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-mask">
      <transition name="modal-zoom">
        <div class="modal-container" v-if="visible">
          <div class="modal-header">
            <span class="modal-header-left">
              <img src="../img/crewTag.png" alt="" srcset="" />
              <span class="modal-title">设备监测</span>
            </span>
            <span class="modal-close" @click="handleClose">×</span>
          </div>
          <div class="modal-body">
            <div class="modal-body-container">
              <div class="hardware-area">
                <img src="../img/hardwarebg.png" alt="" srcset="" />
              </div>
              <div class="modal-body-container-left">
                <div class="modal-body-container-left-header">
                  <div class="modal-body-container-left-header-number">
                    {{ titleName }}
                  </div>
                  <div class="modal-body-container-left-header-item">
                    <span>所在厂房</span>
                    <b>LX</b>
                  </div>
                  <div class="modal-body-container-left-header-item">
                    <span>物理高度</span>
                    <b>0m</b>
                  </div>
                  <div class="modal-body-container-left-header-time">
                    <span>数据更新时间</span>
                    <b> {{ currentDate }} {{ currentTime }}</b>
                  </div>
                </div>
                <div class="modal-body-container-left-main">
                  <div class="modal-body-container-left-main-item">
                    <div class="img-area co2"></div>
                    <div class="word-area">
                      <div class="word-area-title">CO₂在线监测</div>
                      <div class="word-area-data">
                        <b class="green">1.221</b>
                        <span>ppm</span>
                      </div>
                    </div>
                  </div>
                  <div class="modal-body-container-left-main-item">
                    <div class="img-area pm25"></div>
                    <div class="word-area">
                      <div class="word-area-title">PM2.5在线监测</div>
                      <div class="word-area-data">
                        <b class="green">18</b>
                        <span>μg/m³</span>
                      </div>
                    </div>
                  </div>
                  <div class="next-row"></div>
                  <div class="modal-body-container-left-main-item">
                    <div class="img-area co2Red"></div>
                    <div class="word-area">
                      <div class="word-area-title">温度在线监测</div>
                      <div class="word-area-data">
                        <b class="red">78.3</b>
                        <span>°C</span>
                      </div>
                    </div>
                  </div>
                  <div class="modal-body-container-left-main-item">
                    <div class="img-area water"></div>
                    <div class="word-area">
                      <div class="word-area-title">湿度在线监测</div>
                      <div class="word-area-data">
                        <b class="green">45%</b>
                        <span>RH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-body-echarts">
              <div class="modal-body-echarts-header">
                <div class="modal-body-echarts-header-filter">
                  <div class="select-area" v-show="showSelect">
                    <div class="select-area-title">
                      <span>勾选有显示的测点</span>
                      <span @click.stop="handleSelectAll">全选</span>
                      <b @click.stop="handleSelectClear">清空</b>
                    </div>
                    <div class="select-list">
                      <el-checkbox-group v-model="checkList">
                        <el-checkbox label="湿度">湿度</el-checkbox>
                        <el-checkbox label="PM2.5">PM2.5</el-checkbox>
                        <el-checkbox label="静电干扰">静电干扰</el-checkbox>
                        <el-checkbox label="电磁干扰">电磁干扰</el-checkbox>
                        <el-checkbox label="温度">温度</el-checkbox>
                        <el-checkbox label="CO₂">CO₂</el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </div>
                  <span>显示测点：</span>
                  <div class="select-filter" @click="handleShowSelect">
                    已选择{{ checkList.length }}
                  </div>
                </div>
                <div class="modal-body-echarts-header-operate"></div>
              </div>
              <div class="line-chart">
                <lineCharts :checkList="checkList" />
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script scoped>
import lineCharts from "./lineChartsDevice.vue";
export default {
  name: "RoomWatch",
  components: { lineCharts },
  data() {
    return {
      timer: null,
      currentTime: "",
      currentDate: "",
      visible: false,
      showSelect: false,
      checkedShow: true,
      titleName: "W643",
      checkList: ["CO₂"],
    };
  },

  methods: {
    updateTime() {
      const now = new Date();
      // 格式化时分秒（补零）
      const h = this.padZero(now.getHours());
      const m = this.padZero(now.getMinutes());
      const s = this.padZero(now.getSeconds());
      this.currentTime = `${h}:${m}:${s}`;
      // 格式化日期（补零）
      const y = now.getFullYear();
      const mo = this.padZero(now.getMonth() + 1);
      const d = this.padZero(now.getDate());
      this.currentDate = `${y}.${mo}.${d}`;
    },
    padZero(num) {
      return num < 10 ? `0${num}` : num;
    },
    handleSelectAll() {
      this.checkList = ["温度", "湿度", "PM2.5", "静电干扰", "电磁干扰", "CO₂"];
    },
    handleSelectClear() {
      this.checkList = [];
    },
    handleShowSelect() {
      this.showSelect = !this.showSelect;
    },
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    handleClose() {
      this.close();
      console.log("000");
      this.$emit("close");
    },
    handleConfirm() {
      this.$emit("confirm");
      this.close();
    },
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.updateTime();
    }, 1000);
  },
  watch: {
    visible(val) {
      if (!val) {
        this.showSelect = false;
      }
      this.$emit("change", val);
    },
  },
};
</script>

<style scoped lang="less">
@import "../css/utils.less";

/deep/ .el-checkbox__label {
  .px2font(12);
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4); // 白色透明遮罩层，80%透明度
  z-index: 9999;
  display: flex;
  justify-content: center;
  .px2vh_vw(padding-top, 70);
  box-sizing: border-box;
}

.modal-container {
  .px2vw(width, 1260);
  .px2vh_vw(max-height, 840);
  background-color: rgba(19, 26, 34, 0.9);
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  .px2vh_vw(height, 50);
  display: flex;
  align-items: center;
  justify-content: space-between;
  .px2plr(30);
  .px2font(14);

  &-left {
    display: flex;
    align-items: center;

    img {
      .px2vw(width, 24);
      .px2vw(margin-right, 10);
    }

    .modal-title {
      .px2font(16);
    }
  }

  .modal-close {
    .px2font(28);
    cursor: pointer;
    color: #999;
    transition: color 0.3s;

    &:hover {
      color: #333;
    }
  }
}

.modal-body {
  .px2padding(0, 30);

  &-container {
    display: flex;
    .px2vh_vw(margin-bottom, 20);

    .hardware-area {
      overflow: hidden;
      .px2vw(margin-right, 24);
      .px2vw(width, 450);
      .px2vh_vw(height, 271);

      img {
        width: 100%;
      }
    }

    &-left {
      .px2vw(padding-left, 20);

      &-header {
        display: flex;

        &-number {
          .px2font(36);
          letter-spacing: 4px;
          .px2vw(margin-right, 24);
        }

        &-item {
          display: flex;
          flex-direction: column;
          .px2vw(width, 120);
          text-align: center;
          .px2font(15);
          border-left: 2px solid #595e61;
          box-sizing: border-box;
          .px2vh_vw(padding-top, 6);

          span {
            color: #8e9cbf;
          }

          b {
            .px2vh_vw(margin-top, 4);
            font-weight: normal;
          }
        }

        &-time {
          display: flex;
          flex-direction: column;
          .px2vw(padding-left, 30);
          .px2font(15);
          border-left: 2px solid #595e61;
          box-sizing: border-box;
          .px2vw(padding-top, 6);

          span {
            color: #8e9cbf;
          }

          b {
            .px2vh_vw(margin-top, 4);
            font-weight: normal;
          }
        }
      }

      &-main {
        display: flex;
        flex-wrap: wrap;
        box-sizing: border-box;

        .next-row {
          .px2vw(width, 200);
        }

        &-item {
          .px2vw(margin-right, 90);
          .px2vh_vw(margin-top, 40);
          display: flex;

          .img-area {
            .px2vw(width, 60);
            .px2vh_vw(height, 60);
            .px2vw(margin-right, 20);
          }

          .word-area {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;

            &-title {
              color: #96999b;
              .px2font(16);
              .px2vh_vw(margin-bottom, 6);
            }

            &-data {
              display: flex;
              justify-content: space-between;
              .px2vw(width, 140);
              .px2font(18);

              b {
                .px2font(20);
              }

              .green {
                color: #8ded8c;
              }

              .red {
                color: #e13722;
              }

              span {
                .px2font(17);
                color: #727879;
              }
            }
          }

          .co2 {
            background-image: url("../img/water.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .co2Red {
            background-image: url("../img/co2Red.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .co2Yellow {
            background-image: url("../img/co2Yellow.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .pm25 {
            background-image: url("../img/pm25.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .pm25Red {
            background-image: url("../img/pm25Red.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .pm25Yellow {
            background-image: url("../img/pm25Yellow.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .water {
            background-image: url("../img/water.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .waterRed {
            background-image: url("../img/waterRed.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .waterYellow {
            background-image: url("../img/waterYellow.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .electromagnetic {
            background-image: url("../img/electromagnetic.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .electromagneticRed {
            background-image: url("../img/electromagneticRed.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .electromagneticYellow {
            background-image: url("../img/electromagneticYellow.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .lightning {
            background-image: url("../img/lightning.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .lightningRed {
            background-image: url("../img/lightningRed.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .lightningYellow {
            background-image: url("../img/lightningYellow.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .temperature {
            background-image: url("../img/temperature.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .temperatureRed {
            background-image: url("../img/temperatureRed.png");
            background-repeat: no-repeat;
            background-size: cover;
          }

          .temperatureYellow {
            background-image: url("../img/temperatureYellow.png");
            background-repeat: no-repeat;
            background-size: cover;
          }
        }
      }
    }
  }

  &-echarts {
    width: 100%;
    .px2vh_vw(height, 430);
    .px2vh_vw(padding-bottom, 30);
    background-color: #0d1112;
    border: 2px solid #24282a;

    &-header {
      display: flex;
      .px2vh_vw(height, 50);
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      .px2padding(0, 16);

      &-filter {
        position: relative;
        display: flex;
        align-items: center;

        .select-filter {
          .px2vw(width, 154);
          .px2vh_vw(height, 38);
          .px2font(14);
          .px2vw(padding-left, 10);
          .px2vh_vw(line-height, 38);
          cursor: pointer;
          box-sizing: border-box;
          background-image: url("../img/select.png");
          background-repeat: no-repeat;
          background-size: cover;
        }

        span {
          .px2font(13);
          color: #9ba1ae;
        }

        .select-area {
          position: absolute;
          z-index: 999;
          .px2vh_vw(top, 40);
          left: 0;
          background-color: #2a3235;
          border-radius: 5px;
          box-sizing: border-box;
          .px2vw(width, 220);
          .px2padding(6, 6);

          &-title {
            z-index: 99999;
            .px2font(12);
            color: #9ba1ae;
            .px2vw(padding-left, 4);
            .px2vh_vw(margin-bottom, 10);

            b {
              cursor: pointer;
              font-weight: normal;
              color: #6c7280;
            }

            span:nth-child(2) {
              color: #71a3f8 !important;
              .px2vw(margin-left, 10);
              cursor: pointer;
            }
          }

          /deep/ .el-checkbox-group {
            display: flex;
            flex-direction: column;

            .el-checkbox {
              .px2padding(6, 4);
              .px2font(13);
              .px2vw(width, 200);
              display: flex;
              .px2vw(margin-bottom, 4);
              margin-left: 0px;
            }

            .is-checked {
              background-color: #3f4a59;
            }
          }
        }
      }

      &-operate {
        display: flex;
        align-items: center;
        color: #9ba1ae;
        .px2font(13);

        i {
          font-style: normal;
        }

        .all-screen {
          cursor: pointer;
          display: flex;
          align-items: center;
          .px2vw(padding-left, 20);
          color: #8b8f93;

          img {
            .px2vw(width, 18);
            .px2vw(margin-right, 6);
            vertical-align: middle;
          }
        }

        span {
          .px2vw(margin-left, 20);
          color: #8b8f93;
          cursor: pointer;
        }

        /deep/ .el-checkbox {
          display: flex;
          margin-left: 0px;
        }
      }
    }

    .line-chart {
    }
  }
}

// 动画效果
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.modal-zoom-enter,
.modal-zoom-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
