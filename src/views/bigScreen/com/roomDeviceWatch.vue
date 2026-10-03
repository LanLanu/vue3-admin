<!-- 房间检测弹框 -->
<template>
  <div class="model-area " v-if="visible" @click.stop>
    <transition name="modal-fade" @click.stop>
      <div v-if="visible" class="modal-mask" @click.stop>
        <transition name="modal-zoom">
          <div class="modal-container" v-if="visible">
            <div class="modal-header">
              <div class="modal-header-left">
                <img src="../img/roomDevice.png" alt="" srcset="" />
                <span class="room-title">
                  <i>{{type=="ROOM"?titleName:detailData.roomName  }}</i>
                  <b>房间</b>
                </span>
                <span class="factory-title">
                  <b>所在厂房</b>
                  <i>{{detailData.workshop}}</i>
                </span>
                <span class="factory-title">
                  <b>物理高度</b>
                  <i>{{ detailData.physicalHeight }}m</i>
                </span>
                <span class="factory-title" style="text-align: left;">
                  <b>数据更新时间</b>
                  <i> {{ currentDate }} {{ currentTime }}</i>
                </span>
                <span class="factory-title">
                  <b>机柜数量</b>
                  <i>{{ detailData.cabinetCount }} 台</i>
                </span>
                <span class="factory-title" style="text-align: left;">
                  <b>数据状态</b>
                  <i :class="{'status-data':true,'data-normal':detailData.dataStatus=='正常', 'data-error':detailData.dataStatus!='正常'}">
                    <div class="circle-area"></div>
                    <div>{{detailData.dataStatus}}</div>
                  </i>
                </span>
              </div>
              <span class="modal-close" @click="handleClose">×</span>
            </div>
            <div class="modal-body">
              <div class="modal-body-data">
                <div class="modal-body-data-header">
                  <div class="modal-body-data-header-top">
                    <span>测点列表</span>
                    <b>共36个测点</b>
                    <i>已选6/8</i>
                  </div>
                  <div class="modal-body-data-header-bottom">
                    <div class="modal-body-data-header-bottom-filter">
                      <div class="select-area" v-show="showSelectFilter">
                        <div class="select-area-title">
                          <span>筛选测点类型</span>
                          <span @click.stop="handleSelectFilterAll">全选</span>
                          <b @click.stop="handleSelectFilterClear">清空</b>
                        </div>
                        <div class="select-list">
                          <el-checkbox-group v-model="checkFilter">
                            <el-checkbox label="湿度">湿度</el-checkbox>
                            <el-checkbox label="PM2.5">PM2.5</el-checkbox>
                            <el-checkbox label="静电干扰">静电干扰</el-checkbox>
                            <el-checkbox label="电磁干扰">电磁干扰</el-checkbox>
                            <el-checkbox label="温度">温度</el-checkbox>
                            <el-checkbox label="CO₂">CO₂</el-checkbox>
                          </el-checkbox-group>
                        </div>
                      </div>
                      <span>监测类型</span>
                      <div
                        class="select-filter"
                        @click="handleShowSelectFilter"
                      >
                        可多选
                      </div>
                      <div class="input-filter" v-if="false">
                        <img class="input-search" src="../img/searchIcon.png"></img>
                        <el-input
                          v-model="inputFilter"
                          size="small"
                          placeholder="搜索测点或功能位置码"
                        ></el-input>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-body-data-list">
                  <div
                    class="modal-body-data-list-item"
                    v-for="(item, index) in testPointList"
                    :key="index"
                  >
                    <div class="modal-body-data-list-item-header">
                      <el-checkbox v-model="item.checked"></el-checkbox>
                      <i>{{ item.roomOrRack }}</i>
                      <b>2/4</b>
                      <em>
                        <i
                          v-if="!item.collpase"
                          class="el-icon-arrow-down"
                          @click="item.collpase = !item.collpase"
                        ></i>
                        <i
                          v-else
                          class="el-icon-arrow-up"
                          @click="item.collpase = !item.collpase"
                        ></i>
                      </em>
                    </div>
                    <div
                      class="modal-body-data-list-item-point"
                      :style="{
                        'max-height': item.collpase ? '800px' : '0px'
                      }"
                    >
                      <div class="modal-body-data-list-item-point-title">
                        <i>测点名称</i>
                        <i>当前值</i>
                        <i>类型</i>
                        <i>状态</i>
                      </div>
                      <div
                        class="modal-body-data-list-item-point-item"
                        v-for="(subItem, subIndex) in item.list"
                        :key="subIndex"
                      >
                        <el-checkbox v-model="subItem.checked"></el-checkbox>
                        <div class="point-name">{{ subItem.name }}</div>
                        <div
                          class="point-value"
                          :style="{
                            color: subItem.status == 1 ? '#bcdcfb' : '#e67f31'
                          }"
                        >
                          {{ subItem.value }}
                        </div>
                        <div class="point-type">{{ subItem.type }}</div>
                        <div :class="getPointCircleColor(subItem.status, true)">
                          <div class="status-circle "></div>
                          <span>{{
                            getPointCircleColor(subItem.status, false)
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-body-chart">
                <div class="modal-body-chart-header">
                  <i>实时曲线图</i>
                  <div class="filter-area">
                    <div class="filter-area-type">
                      <div class="select-area" v-show="showSelectType">
                        <div class="select-area-title">
                          <span>勾选要显示的测点</span>
                          <span @click.stop="handleSelectObjAll">全选</span>
                          <b @click.stop="handleSelectObjClear">清空</b>
                        </div>
                        <div class="select-list">
                          <el-checkbox-group v-model="checkedObj">
                            <el-checkbox
                              v-for="item in checkedObjList"
                              :key="item.roomOrRack"
                              :label="item.roomOrRack"
                              >{{ item.roomOrRack }}</el-checkbox
                            >
                          </el-checkbox-group>
                        </div>
                      </div>
                      <span>显示对象：</span>
                      <div class="select-filter" @click="handleShowSelectType">
                        已选择{{ checkedObj.length }}
                      </div>
                    </div>
                    <div class="filter-area-show">
                      <div class="select-area" v-show="showSelect">
                        <div class="select-area-title">
                          <span>勾选要显示的类型</span>
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
                      <span>显示类型：</span>
                      <div class="select-filter" @click="handleShowSelect">
                        已选择{{ checkList.length }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-body-chart-data">
                  <lineChartsRoomDevice
                    :checkList="checkList"
                    :tipFlag="checkedShow"
                  />
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script scoped>
import lineChartsRoomDevice from "./lineChartsRoomDevice.vue";
export default {
  name: "RoomWatch",
  components: { lineChartsRoomDevice },
  data() {
    return {
      detailData:{},
      currentRackData:{},
      inputFilter: "",
      type: "",
      testPointList: [
        {
          roomOrRack: "房间Y603",
          checked: false,
          collpase: true,
          list: [
            {
              checked: false,
              name: "4Y603_MT001",
              value: "24.6℃",
              type: "温度",
              status: 1
            },
            {
              checked: true,
              name: "4Y603_MT001",
              value: "24.6℃",
              type: "温度",
              status: 0
            },
            {
              checked: true,
              name: "4Y603_MT001",
              value: "24.6℃",
              type: "温度",
              status: 0
            },
            {
              checked: false,
              name: "4Y603_MT001",
              value: "37℃",
              type: "温度",
              status: 0
            },
            {
              checked: true,
              name: "4Y603_MT001",
              value: "37℃",
              type: "温度",
              status: 0
            },
            {
              checked: false,
              name: "4Y603_MT001",
              value: "37℃",
              type: "温度",
              status: 0
            },
            {
              checked: false,
              name: "4Y603_MT001",
              value: "37℃",
              type: "温度",
              status: 0
            }
          ]
        },
        // {
        //   roomOrRack: "机柜CL1",
        //   checked: false,
        //   collpase: false,
        //   list: [
        //     {
        //       checked: false,
        //       name: "Y3APA245VL_MT001",
        //       value: "24.6℃",
        //       type: "温度",
        //       status: 1
        //     },
        //     {
        //       checked: true,
        //       name: "Y3APA245VL_MT001",
        //       value: "24.6℃",
        //       type: "温度",
        //       status: 0
        //     },
        //     {
        //       checked: true,
        //       name: "Y3APA245VL_MT001",
        //       value: "27",
        //       type: "湿度",
        //       status: 0
        //     },
        //     {
        //       checked: false,
        //       name: "Y3APA245VL_MT001",
        //       value: "37℃",
        //       type: "温度",
        //       status: 0
        //     }
        //   ]
        // },
        // {
        //   roomOrRack: "机柜CL2",
        //   checked: false,
        //   collpase: false,
        //   list: [
        //     {
        //       checked: false,
        //       name: "Y3APA245VL_MT001",
        //       value: "24.6℃",
        //       type: "温度",
        //       status: 1
        //     },
        //     {
        //       checked: true,
        //       name: "Y3APA245VL_MT001",
        //       value: "24.6℃",
        //       type: "温度",
        //       status: 0
        //     },
        //     {
        //       checked: true,
        //       name: "Y3APA245VL_MT001",
        //       value: "24.6℃",
        //       type: "温度",
        //       status: 0
        //     },
        //     {
        //       checked: false,
        //       name: "Y3APA245VL_MT001",
        //       value: "37℃",
        //       type: "温度",
        //       status: 0
        //     }
        //   ]
        // }
      ],
      checkedObjList: [],
      checkedObj: [],
      checkFilter: [],
      timer: null,
      currentTime: "",
      currentDate: "",
      visible: false,
      showSelect: false,
      showSelectObj: false,
      showSelectFilter: false,
      showSelectType: false,
      checked: false,
      checkedShow: true,
      titleName: "",
      checkList: ["温度", "湿度", "PM2.5", "静电干扰", "电磁干扰", "CO₂"]
    };
  },
  computed: {},
  methods: {
    getPointCircleColor(status, flag = true) {
      if (flag) {
        switch (status) {
          // 0异常1正常2错误
          case 0:
            return { "point-status": true, "status-warning": true };
          case 2:
            return { "point-status": true, "status-error": true };
        }
        return { "point-status": true, "status-normal": true };
      } else {
        switch (status) {
          // 0异常1正常2错误
          case 0:
            return "异常";
          case 1:
            return "正常";
          case 2:
            return "错误";
        }
        return "正常";
      }
    },
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
      this.currentDate = `${y}-${mo}-${d}`;
    },
    padZero(num) {
      return num < 10 ? `0${num}` : num;
    },
    handleSelectAll() {
      this.checkList = ["温度", "湿度", "PM2.5", "静电干扰", "电磁干扰", "CO₂"];
    },
    handleSelectFilterAll() {
      this.checkFilter = [
        "温度",
        "湿度",
        "PM2.5",
        "静电干扰",
        "电磁干扰",
        "CO₂"
      ];
    },
    handleSelectObjAll() {
      this.checkedObj = this.checkedObjList.map(item => item.roomOrRack);
    },
    handleSelectObjClear() {
      this.checkedObj = [];
    },
    handleSelectClear() {
      this.checkList = [];
    },
    handleSelectFilterClear() {
      this.checkFilter = [];
    },
    handleShowSelectObj() {
      this.showSelectObj = !this.showSelectObj;
    },
    handleShowSelectFilter() {
      this.showSelectFilter = !this.showSelectFilter;
    },
    handleShowSelectType() {
      this.showSelectType = !this.showSelectType;
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
      console.log(11);

      this.close();
      this.$emit("close");
    },
    handleConfirm() {
      this.$emit("confirm");
      this.close();
    }
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.updateTime();
    }, 1000);
    // const setObj = generateBatchMockData(5,15,80)


  },
  watch: {
    visible(val) {
      if (!val) {
        this.showSelect = false;
      }
      this.$emit("change", val);
    },
    testPointList: {
      handler(val) {
        this.checkedObj = [];
        this.checkedObjList = [...val.filter(item => item.checked)];
      },
      deep: true
    },
    async titleName(val) {
      let params ={}
      params.type = this.type
      if(this.type=="ROOM"){
        params.roomName = this.currentRackData.roomName
        params.id = this.currentRackData.roomId
      }else{
        params.id = this.currentRackData.cabinetId
        params.roomName = "aaaa"
      }
     try {
      // const res= await detail(params)
      // console.log('>>>>>>res详情',res);
      // if(res.code==0){
      //   this.detailData = res.data
      // }else{
      //   this.$message.error(res.message)
      // }
     } catch (error) {
    }
    }
  }
};
</script>

<style scoped lang="less">
@import "../css/utils.less";
.model-area {
  z-index: 1001;
  background-color: #0e1623;
  i,
  em {
    font-style: normal;
  }
  b,
  strong {
    font-weight: normal;
  }
}
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4); // 白色透明遮罩层，80%透明度
  z-index: 1002;
  display: flex;
  justify-content: center;
  .px2vh_vw(padding-top, 70);
  box-sizing: border-box;
}

.modal-container {
  position: relative;
  .px2vw(width, 1760);
  .px2vh_vw(max-height, 840);
  border-radius: 5px;
  // max-height: 840px;
  background-color: #0e1112;
  border-radius: 8px;
  overflow: hidden;
  z-index: 1003;
}

.modal-header {
  .px2vh_vw(height, 100);
  display: flex;
  align-items: center;
  justify-content: space-between;
  .px2plr(30);
  .px2font(14);

  &-left {
    display: flex;
    align-items: center;
    position: relative;
    img {
      .px2vw(width, 60);
      .px2vw(margin-right, 10);
      cursor: pointer;
    }

    .room-title {
      display: flex;
      flex-direction: column;
      .px2vw(margin-left, 30);
      i {
        .px2font(18);
        font-weight: bold;
      }
      b {
        display: block;
        color: #8491a1;
        .px2font(12);
      }
    }
    .factory-title {
      display: flex;
      flex-direction: column;
      text-align: center;
      .px2vw(margin-left, 30);
      .px2vw(padding-left, 30);
      .px2font(15);
      border-left: 2px solid #595e61;
      b {
        .px2vh_vw(margin-top, 6);
        .px2font(18);
        color: #8491a1;
      }
      i {
        .px2font(18);
      }
      .status-data {
        display: flex;
        align-items: center;
        .circle-area {
          .px2vw(margin-right, 10);
          .px2vw(width, 16);
          .px2vh_vw(height, 16);
          border-radius: 50%;
          background-color: #8ef860;
        }
      }
      .data-normal {
        color: #8ef860;
        .circle-area {
          background-color: #8ef860;
        }
      }
      .data-warning {
        color: #e67f31;
        .circle-area {
          background-color: #e67f31;
        }
      }
      .data-error {
        color: #e36246;
        .circle-area {
          background-color: #e36246;
        }
      }
    }
  }

  .modal-close {
    position: absolute;
    .px2vw(right, 20);
    .px2vh_vw(top, 10);
    .px2font(28);
    cursor: pointer;
    color: #999;
    transition: color 0.3s;

    &:hover {
      color: #333;
    }
  }
}

/deep/ .el-checkbox__label {
  .px2font(12);
}
/deep/ .el-checkbox__inner {
  border-color: #4f6072;
  transform: scale(0.9);
}

.modal-body {
  display: flex;
  .px2plr(30);
  .modal-body-data {
    .px2vh_vw(padding-top, 16);
    .px2vw(width, 420);
    box-sizing: border-box;
    .px2vw(margin-right, 16);
    // TODO
    .px2vh_vw(height, 710);
    border: 1px solid #28384c;
    border-radius: 8px;
    .modal-body-data-header {
      .px2plr(16);
      &-top {
        display: flex;
        align-items: last baseline;
        .px2font(18);
        b {
          .px2vw(margin-left, 36);
          .px2font(12);
          color: #8491a1;
        }
        i {
          text-align: right;
          flex: 1;
          color: #8491a1;
          .px2font(12);
        }
      }
      &-bottom {
        .px2vh_vw(margin-top, 12);
        color: #748190;
        &-filter {
          position: relative;
          display: flex;
          align-items: center;
          .select-filter {
            .px2vw(width, 100);
            .px2vh_vw(height, 30);
            .px2font(14);
            .px2vw(margin-right, 10);
            .px2vw(padding-left, 10);
            .px2vh_vw(line-height, 29);
            cursor: pointer;
            box-sizing: border-box;
            // background-image: url("../img/select.png");
            background-repeat: no-repeat;
            background-size: cover;
            border: 1px solid #2f4259;
            border-radius: 5px;
          }
          .input-filter {
            position: relative;
            flex: 1;
            .input-search{
              cursor: pointer;
              position: absolute;
              .px2vw(width, 24);
              .px2vh_vw(height, 24);
              .px2vh-vw(left, 2);
              .px2vh_vw(top, 2);
              z-index: 1;
            }
            .el-input {
              .px2font(13);
            }
            /deep/ .el-input__inner {
              color: #748190;
              .px2vh-vw(height, 30);
              .px2vw(padding-left, 26);
              border-color: #2f4259;
            }
            /deep/ .el-input__inner::placeholder {
              color: #748190;
            }
          }
          span {
            .px2vw(width, 70);
            .px2font(13);
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
              .px2vw(padding-left, 6);
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
                .px2font(12);
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
      }
    }
    .modal-body-data-list {
      .px2vh_vw(margin-top, 10);
      .px2plr(16);
      .px2vh_vw(max-height, 620);
      overflow: auto;
      &-item {
        .el-checkbox {
          margin-right: 0;
        }
        &-header {
          display: flex;
          .px2padding(0, 8);
          align-items: center;
          background-color: #16243a;
          .px2vh_vw(height, 30);
          i {
            cursor: pointer;
            .px2font(15);
            .px2vw(margin-right, 20);
            .px2vw(margin-left, 20);
          }
          b {
            .px2font(12);
            color: #7b8899;
          }
          em {
            flex: 1;
            text-align: right;
            i {
              .px2vw(margin-right, 0);
              .px2vw(margin-left, 0);
              color: #7b8899;
            }
          }
        }
        &-point {
          transition: all 0.2s ease-in-out;
          max-height: 1000px;
          overflow: hidden;
          &-title {
            display: flex;
            align-items: center;
            .px2vh_vw(height, 30);
            border-bottom: 2px solid #283648;
            box-sizing: border-box;

            i {
              color: #7b8899;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              transform: scale(0.9);
            }
            i:nth-child(1) {
              .px2vw(width, 180);
              text-align: center;
              .px2vw(margin-left, 20);
            }
            i:nth-child(2) {
              .px2vw(width, 100);
            }
            i:nth-child(3) {
              .px2vw(width, 80);
            }
            i:nth-child(4) {
              .px2vw(width, 80);
            }
          }
          &-item {
            color: #7b8899;
            border-bottom: 2px solid #1d2b3b;
            box-sizing: border-box;
            display: flex;
            .px2vh_vw(height, 36);
            .px2vh_vw(line-height, 36);
            align-items: center;
            .point-name {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              transform: scale(0.9);
              .px2vw(width, 180);
              text-align: center;
            }
            .point-value {
              color: #bcdcfb;
              .px2vw(width, 100);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              transform: scale(0.9);
            }
            .point-type {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              transform: scale(0.9);
              .px2vw(width, 80);
            }
            .point-status {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              transform: scale(0.9);
              .px2vw(width, 80);
              display: flex;
              align-items: center;
              span {
                color: #8ef860;
              }
              .status-circle {
                .px2vw(margin-right, 10);
                .px2vw(width, 10);
                .px2vh_vw(height, 10);
                border-radius: 50%;
                background-color: #8ef860;
              }
            }
            .status-normal {
              span {
                color: #8ef860;
              }
              .status-circle {
                background-color: #8ef860;
              }
            }
            .status-warning {
              span {
                color: #e67f31;
              }
              .status-circle {
                background-color: #e67f31;
              }
            }
            .status-error {
              span {
                color: #e36246;
              }
              .status-circle {
                background-color: #e36246;
              }
            }
          }
          &-item:last-child {
            border-bottom: 0;
          }
        }
      }
    }
  }
  .modal-body-chart {
    .px2vh_vw(padding-top, 16);
    border-radius: 8px;
    flex: 1;
    border: 1px solid #28384c;
    .modal-body-chart-header {
      display: flex;
      justify-content: space-between;
      .px2padding(0, 20);
      i {
        .px2font(17);
        font-weight: bold;
      }
      .filter-area {
        display: flex;
        &-show {
          position: relative;
          display: flex;
          align-items: center;
          .px2vw(padding-left, 20);

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
              .px2vw(padding-left, 6);
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
                .px2font(12);
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
        &-type {
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
              .px2vw(padding-left, 6);
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
                .px2font(12);
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
      }
    }
    .modal-body-chart-data {
      background-color: red;
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
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-zoom-enter,
.modal-zoom-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
