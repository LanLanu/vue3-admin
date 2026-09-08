<template>
  <div class="lqwkfbwklndfqow">
    <!-- 左侧 -->
    <div :class="{ left: true, 'bg-blur': blurFlag }">
      <div class="left-top">
        <img src="../img/leftTitle.png" alt="设备与环境监测总数" />
        <div class="qwkwfbqoej">
          <div class="title-text">设备与环境监测总数</div>
          <div class="value-text">
            <span>{{ deviceEnvironmentCount.total }}</span
            >套
          </div>
        </div>
        <div class="unit-icon">
          <div v-for="item in unitList" class="item-cion">
            <img src="../img/unitIcon.png" />
            <div class="qwqifohqwif">
              <div class="qwdehqwiouhfuoew">{{ item.text }}</div>
              <!-- 中间横线 -->
              <div class="divider-line"></div>
              <div class="qfwdqwdqwdqd">
                <span>{{ item.value }}</span>
                <span>套</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="left-btm">
        <div class="bar-filter">
          <div class="select-filter" @click="handleShowBarFilter">
            <i class="el-icon-arrow-down"></i>
            {{ barFilter }}
            <div class="select-area" v-show="showBarFilter">
              <div
                class="select-item"
                v-for="(item, index) in barFilterList"
                :key="index"
                @click="barFilter = item"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
        <img src="../img/leftTitle2.png" alt="CCM设备异常统计" />
        <div class="bar-chart" ref="barChart"></div>
        <div class="pie-chart" ref="pieChart"></div>
      </div>
    </div>
    <!-- 中间 -->
    <div class="middle" v-show="!showActiveCrew">
      <div
        :class="{ 'crew-area': true, 'crew-two': true, active: fullPosition }"
        @click="handleActiveCrew('2号机组')"
      >
        <img src="../img/two.png" alt="" srcset="" />
        <img src="../img/twohover.png" alt="" srcset="" />
      </div>
      <div
        :class="{ 'crew-area': true, 'crew-one': true, active: fullPosition }"
        @click="handleActiveCrew('1号机组')"
      >
        <img src="../img/one.png" alt="" srcset="" />
        <img src="../img/onehover.png" alt="" srcset="" />
      </div>
      <div class="crew-area crew-four" @click="handleActiveCrew('4号机组')">
        <img src="../img/four.png" alt="" srcset="" />
        <img src="../img/fourhover.png" alt="" srcset="" />
      </div>
      <div
        :class="{ 'crew-area': true, 'crew-three': true, active: fullPosition }"
        @click="handleActiveCrew('3号机组')"
      >
        <img src="../img/three.png" alt="" srcset="" />
        <img src="../img/threehover.png" alt="" srcset="" />
      </div>
      <div
        :class="{ 'crew-area': true, 'crew-six': true, active: fullPosition }"
        @click="handleActiveCrew('6号机组')"
      >
        <img src="../img/six.png" alt="" srcset="" />
        <img src="../img/sixhover.png" alt="" srcset="" />
      </div>
      <div
        :class="{ 'crew-area': true, 'crew-five': true, active: fullPosition }"
        @click="handleActiveCrew('5号机组')"
      >
        <img src="../img/five.png" alt="" srcset="" />
        <img src="../img/fivehover.png" alt="" srcset="" />
      </div>
    </div>
    <div class="middle-filter" v-show="showActiveCrew">
      <AcitveCrewGroup
        @close="showActiveCrew = false"
        @change="handleChange"
        :currentCrew="activeCrewName"
      />
    </div>
    <!-- 右侧 -->
    <div :class="{ right: true, 'bg-blur': blurFlag }">
      <div class="right-top">
        <img src="../img/rightTitle.png" alt="当前异常报警清单" />
        <div class="owehfiwejn">
          <div
            v-for="(item, index) in abnormalityList"
            :key="index"
            class="qwoudhuoqw"
          >
            <span>{{ item.text }}</span>
            <span>{{ item.value }}</span>
          </div>
        </div>

        <div class="alarm-list-container">
          <!-- 列表头部（可选，和列表样式统一） -->
          <div class="list-header">
            <span class="col-device">设备编号</span>
            <span class="col-type">设备类型</span>
            <span class="col-time">告警时间</span>
          </div>
          <!-- 可滚动列表主体 -->
          <div class="list-scroll">
            <div
              class="list-item highlight"
              v-for="(item, index) in alarmList"
              :key="index"
            >
              <!-- :class="{ highlight: index < 2 }" -->
              <span class="col-device">{{ item.deviceNo }}</span>
              <span class="col-type">{{ item.deviceType }}</span>
              <span class="col-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="right-btm">
        <img src="../img/rightTitle2.png" alt="当前异常报警清单" />
        <div class="alarm-list-container">
          <!-- 列表头部（可选，和列表样式统一） -->
          <div class="list-header">
            <span class="col-device">报警标题</span>
            <!-- <span class="col-type">设备类型</span> -->
            <span class="col-time">告警时间</span>
          </div>
          <!-- 可滚动列表主体 -->
          <div class="list-scroll">
            <div
              class="list-item highlight"
              v-for="(item, index) in alarmLogList"
              :key="index"
            >
              <!-- :class="{ highlight: index < 2 }" -->
              <span
                class="col-device"
                :style="{ color: index / 2 == 2 ? '#ffa600' : '#ff2727' }"
                >{{ item.msg }}</span
              >
              <!-- <span class="col-type">{{ item.msg }}</span> -->
              <span class="col-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script scoped>
import * as echarts from "echarts"; // 引入 ECharts
import AcitveCrewGroup from "./acitveCrewGroup.vue";
export default {
  components: { AcitveCrewGroup },
  props: {
    menuNumber: {
      type: Number,
      default: 1,
    },
    fullPosition: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pieErrorCount: 0,
      pieInstance: null,
      barInstance: null,
      deviceEnvironmentCount: {
        total: 0,
      },
      barFilter: "当月",
      barFilterList: ["当月", "上个月", "上半年"],
      blurFlag: false,
      showBarFilter: false,
      showActiveCrew: false,
      activeCrewName: "4号机组",
      unitList: [
        { id: "576124871269", label: "3R", text: "3R -", value: 0 },
        { id: "123152252352", label: "KCP", text: "KCP -", value: 0 },
        { id: "23523523623623451341", label: "TCS", text: "TCS -", value: 0 },
        { id: "64578786567", label: "KRT", text: "KRT -", value: 0 },
        { id: "576124871269", label: "room", text: "房间 -", value: 0 },
      ],
      abnormalityList: [
        { id: "576124871269", text: "全部", value: 12 },
        { id: "123152252352", text: "温度", value: 3 },
        { id: "23523523623623451341", text: "湿度", value: 6 },
        { id: "64578786567", text: "PM2.5", value: 0 },
        { id: "576124871270", text: "CO₂", value: 0 },
        { id: "576124871271", text: "电量", value: 1 },
        { id: "576124871272", text: "静电", value: 2 },
        { id: "576124871273", text: "电磁干扰", value: 0 },
      ],
      alarmList: [
        {
          id: "1",
          deviceNo: "4RGL001AR-1",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "2",
          deviceNo: "4RGL001AR-2",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "3",
          deviceNo: "4RGL011AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "4",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "5",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "6",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "7",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "2",
          deviceNo: "4RGL001AR-2",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "3",
          deviceNo: "4RGL011AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "4",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "5",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "6",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "7",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "2",
          deviceNo: "4RGL001AR-2",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "3",
          deviceNo: "4RGL011AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "4",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "5",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "6",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "7",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "2",
          deviceNo: "4RGL001AR-2",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "3",
          deviceNo: "4RGL011AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "4",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "5",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "6",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "7",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "2",
          deviceNo: "4RGL001AR-2",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "3",
          deviceNo: "4RGL011AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "4",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "5",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "6",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "7",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "2",
          deviceNo: "4RGL001AR-2",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "3",
          deviceNo: "4RGL011AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "4",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "5",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "6",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "7",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "2",
          deviceNo: "4RGL001AR-2",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "3",
          deviceNo: "4RGL011AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "4",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "5",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "6",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "7",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "2",
          deviceNo: "4RGL001AR-2",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "3",
          deviceNo: "4RGL011AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "4",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "5",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "6",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
        {
          id: "7",
          deviceNo: "4RGL012AR",
          deviceType: "继电器柜",
          time: "2025-01-01 01:01:01",
        },
      ],
      alarmLogList: [
        {
          id: "1",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "2",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "3",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "4",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "5",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "6",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "7",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "8",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "9",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "10",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "11",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "2",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "3",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "4",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "5",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "6",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "7",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "8",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "9",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "10",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "11",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "2",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "3",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "4",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "5",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "6",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "7",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "8",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "9",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "10",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "11",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "2",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "3",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "4",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "5",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "6",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "7",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "8",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "9",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "10",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "11",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "2",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "3",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "4",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "5",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "6",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "7",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "8",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "9",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "10",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "11",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "2",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "3",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "4",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "5",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "6",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "7",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "8",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "9",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "10",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "11",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "2",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "3",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "4",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "5",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "6",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "7",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "8",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "9",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "10",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "11",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "2",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "3",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "4",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "5",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "6",
          level: "orange",
          msg: "XX诊断异常，数据状态为橙色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "7",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "8",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "9",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "10",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
        {
          id: "11",
          level: "red",
          msg: "XX诊断异常，数据状态为红色报警",
          time: "2025-09-01 11:00:01",
        },
      ],
    };
  },
  computed: {},
  created() {},
  async mounted() {
    this.getDeviceEnvironMent();
    await this.getPieData();
    this.initChart();

    // try {
    //   const res2 = await currentAlarmList("Y4");
    //   console.log("当前异常报警清单", res2);
    // } catch (error) {}
  },
  methods: {
    handleCrewName(name) {
      let crew = "";
      switch (name) {
        case "1号机组":
          crew = "Y1";
          break;
        case "2号机组":
          crew = "Y2";
          break;
        case "3号机组":
          crew = "Y3";
          break;
        case "4号机组":
          crew = "Y4";
          break;
        case "5号机组":
          crew = "Y5";
          break;
        case "6号机组":
          crew = "Y6";
          break;
      }
      return crew;
    },
    async getPieData() {
      // const res = await alarmPieStatistics(
      //   this.handleCrewName(this.activeCrewName)
      // );
      // try {
      //   if (res.code == 0) {
      //     this.pieErrorCount = res.data.totalCount;
      //     return this.initPieChart(res.data.typeList);
      //   }
      //   console.log("设备异常统计-饼图", res);
      //   this.initPieChart();
      // } catch (error) {}
      this.initPieChart();
    },
    async getDeviceEnvironMent() {
      try {
        // const res = await monitorStatistics(
        //   this.handleCrewName(this.activeCrewName)
        // );
        // if (res.code == 0) {
        //   this.deviceEnvironmentCount.total = res.data.totalCount;
        //   const typeList = res.data.typeList;
        //   console.log("typeList", typeList);

        //   if (Array.isArray(typeList) && typeList.length) {
        //     if (typeList.find(item => item.ccmGroup == "3R")) {
        //       this.unitList[0].value = typeList.find(
        //         item => item.ccmGroup == "3R"
        //       ).count;
        //     }
        //     if (typeList.find(item => item.ccmGroup == "KCP")) {
        //       this.unitList[1].value = typeList.find(
        //         item => item.ccmGroup == "KCP"
        //       ).count;
        //     }
        //     if (typeList.find(item => item.ccmGroup == "TCS")) {
        //       this.unitList[2].value = typeList.find(
        //         item => item.ccmGroup == "TCS"
        //       ).count;
        //     }
        //     if (typeList.find(item => item.ccmGroup == "KRT")) {
        //       this.unitList[3].value = typeList.find(
        //         item => item.ccmGroup == "KRT"
        //       ).count;
        //     }
        //     if (
        //       typeList.filter(item => item.ccmGroup.includes("房间")).length
        //     ) {
        //       const roomList = typeList
        //         .filter(item => item.ccmGroup.includes("房间"))
        //         .map(item => Number(item.count))
        //         .flat(1);
        //       this.unitList[4].value = roomList.reduce(
        //         (total, item) => total + Number(item) || 0,
        //         0
        //       );
        //     }
        //   }
        // } else {
        //   this.$message.error(res.message);
        // }
        console.log("设备环境总数", res.data);
      } catch (error) {
        console.log(error);
      }
    },
    handleShowBarFilter() {
      this.showBarFilter = !this.showBarFilter;
    },
    handleChange(flag) {
      this.blurFlag = flag;
      console.log("222", this.blurFlag);
      this.$emit("changeBlur", flag);
    },
    initChart() {
      this.initBarChart();
    },
    initBarChart() {
      const chartDom = this.$refs.barChart;
      const myChart = echarts.init(chartDom);
      const dataList = [23, 43, 10, 4, 19];
      const option = {
        grid: {
          left: "1%",
          right: "1%",
          bottom: "5%",
          top: "14%",
          containLabel: true,
        },
        // 👇 X 轴（3R、KCP、TCS、KRT、房间）
        xAxis: [
          {
            type: "category",
            data: ["3R", "KCP", "TCS", "KRT", "房间"],
            axisTick: { show: false },
            axisLine: {
              show: true,
              lineStyle: { color: "rgba(255, 255, 255, 0.5)" },
            },
            axisLabel: {
              color: "#fff",
              fontSize: 12,
              // 文字下方深色小背景块（截图样式）
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              padding: [3, 8],
              // borderRadius: 3
            },
          },
        ],
        // 👇 Y 轴白色虚线
        yAxis: {
          type: "value",
          show: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(255, 255, 255, 0.2)",
              type: "dashed", // 虚线样式
              width: 1,
            },
          },
        },
        // 👇 柱子 + 顶部圆点 + 数值（完全还原截图）
        series: [
          {
            type: "bar",
            barWidth: 32,
            data: dataList, // 截图里的真实数值
            // 柱子渐变蓝色
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(0, 178, 255, 0.43)" },
                { offset: 1, color: "rgba(0, 187, 255, 0.76)" },
              ]),
            },
            // 柱子顶部数值
            label: {
              show: true,
              position: "top",
              color: "#fff",
              fontSize: 12,
              // fontWeight: "bold"
            },
          },
          // 顶部小白点（正中心）
          {
            type: "scatter",
            data: dataList,
            symbol: "circle",
            symbolSize: 4,
            itemStyle: {
              color: "#ffffff",
              shadowBlur: 5, // 发光强度
              shadowColor: "#56CCF2", // 发光颜色
            },
            z: 10,
          },
          // 白点连到底部的竖线
          {
            type: "custom",
            renderItem: function (params, api) {
              let x = api.coord([api.value(0), api.value(1)])[0];
              return {
                type: "line",
                shape: {
                  x1: x,
                  y1: api.coord([api.value(0), 0])[1],
                  x2: x,
                  y2: api.coord([api.value(0), api.value(1)])[1],
                },
                style: {
                  stroke: "rgba(0, 178, 255, 0.57)",
                  lineWidth: 1,
                },
              };
            },
            data: dataList,
            z: 9,
          },
        ],
      };
      myChart.setOption(option);
      window.addEventListener("resize", () => myChart.resize());
    },
    initPieChart(list = []) {
      const chartDom = this.$refs.pieChart;
      if (this.pieInstance) this.pieInstance.dispose();
      this.pieInstance = echarts.init(chartDom);
      // 数据：根据截图比例，总和为 100%
      let data = [
        { value: 0, name: "3R", itemStyle: { color: "#FFF717" } }, // 黄色
        { value: 0, name: "KCP", itemStyle: { color: "#ffce9d" } }, // 浅绿
        { value: 0, name: "TCS", itemStyle: { color: "#ff2727" } }, // 蓝色
        { value: 0, name: "KRT", itemStyle: { color: "#ff7e72" } }, // 浅蓝
        { value: 0, name: "房间", itemStyle: { color: "#ffc300" } }, // 黄色 (19+19+19+19+24=100)
      ];
      if (list && list.length) {
        const roomList = list.filter((item) => item.ccmGroup.includes("房间"));
        let roomValue = 0;
        data = data.map((item) => {
          let percentage = 0;
          const temp = list.find((subItem) => subItem.ccmGroup == item.name);
          if (temp) {
            percentage = temp.percentage;
          }
          return { ...item, value: percentage };
        });
        if (roomList.length) {
          roomValue = roomList
            .map((item) => item.percentage)
            .reduce((total, percentage) => total + Number(percentage) || 0, 0);
        }
        data[4].value = roomValue;
      }
      console.log("data124", data);

      const option = {
        // 👇 核心配置：环形图 + 图例位置
        legend: {
          orient: "vertical",
          right: "0%",
          top: "center",
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 15,
          textStyle: {
            fontSize: 12,
            rich: {
              name: {
                color: "#B4DAFF",
              },
              num: {
                color: "#fff",
              },
            },
          },
          formatter: (name) => {
            const item = data.find((d) => d.name === name);
            return `{name|${name}:} {num|${item ? item.value : 0}%}`;
          },
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        // 中间文字：正确写法（最外层，不是 series 里）
        graphic: [
          // 中间大数字 99
          {
            type: "text",
            left: "29.5%", // 与饼图 center 对齐
            top: "38%",
            style: {
              text: this.pieErrorCount,
              fill: "#FFFFFF",
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
            },
          },
          // 中间分割线
          {
            type: "rect",
            left: "23%",
            top: "51%",
            shape: {
              width: 70,
              height: 1,
            },
            style: {
              fill: "rgba(255,255,255,0.3)",
            },
          },
          // 中间副标题 异常总数
          {
            type: "text",
            left: "25%",
            top: "56%",
            style: {
              text: "异常总数",
              fill: "#B4DAFF",
              fontSize: 12,
              textAlign: "center",
            },
          },
        ],

        series: [
          {
            name: "异常总数",
            type: "pie",
            // 👇 环形宽度，决定圆环粗细
            radius: ["55%", "70%"],
            center: ["33%", "50%"], // 图表靠左，留出空间给图例
            data: data,
            // 隐藏标签，只在中间显示
            label: {
              show: false,
            },
            // 线条连接（可选），截图没有所以关闭
            labelLine: {
              show: false,
            },
            // 鼠标悬浮高亮
            emphasis: {
              scale: false,
            },
          },
        ],
      };
      this.pieInstance.setOption(option);
      window.addEventListener("resize", () => this.pieInstance.resize());
    },
    handleActiveCrew(crewName) {
      this.activeCrewName = crewName;
      this.$emit("changeCrew", crewName);
      this.showActiveCrew = true;
    },
  },
  watch: {
    menuNumber(val) {
      this.showActiveCrew = false;
    },
    showActiveCrew(val) {
      console.log(">>>>>val", val);
      this.$emit("activeCrew", val);
    },
  },
  beforeDestroy() {
    if (this.pieInstance) {
      this.pieInstance.dispose();
      this.pieInstance = null;
    }
  },
};
</script>

<style scoped lang="less">
@import "../css/utils.less";

.bg-blur {
  filter: blur(3px);
}

.lqwkfbwklndfqow {
  width: 100%;
  height: 100%;
  color: white;
  // font-size: 12px;
  .px2font(12);
  display: flex;
  justify-content: space-between;
  position: relative;

  .left {
    width: 19%;
    height: 100%;
    padding: 1%;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    .left-top {
      width: 100%;
      height: 35%;
      display: flex;
      flex-direction: column;
      align-items: center;

      img {
        .px2vw(width, 325);
        .px2vh(height, 28);
      }

      .qwkwfbqoej {
        width: 100%;
        .px2vh(height, 40);
        .px2vh(margin-top, 8);
        .px2vh(margin-bottom, 8);
        .px2vw(padding-left, 20);
        .px2vw(padding-right, 20);
        box-sizing: border-box;
        background-color: rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title-text {
          position: relative;
          color: #ffffff;
          .px2vw(padding-left, 10);
          box-sizing: border-box;

          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 2px;
            .px2vh(height, 15);
            background: linear-gradient(to bottom, #6ccaff, #00aaff);
            box-shadow: 0 0 8px rgba(64, 169, 255, 0.5);
            // border-radius: 2px;
          }
        }

        .value-text {
          color: rgba(173, 195, 246, 0.76);
          .px2font(12);
          display: flex;
          justify-content: center;
          align-items: center;

          span {
            .px2vw(margin-right, 8);
            color: #5dceff;
            .px2font(18);
            font-weight: 600;
          }
        }
      }

      .unit-icon {
        width: 100%;
        .px2heightcalc(100%, 84);
        // background-color: rgba(255, 0, 0, 0.3);
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .item-cion {
          .px2widthcalc(50%, 5);
          .px2vh(height, 54);
          display: flex;
          align-items: center;
          justify-content: space-around;

          img {
            .px2vw(width, 52);
            height: 100%;
            transform: translateY(5px);
          }

          .qwqifohqwif {
            .px2vw(width, 95);
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;

            .qwdehqwiouhfuoew,
            .qfwdqwdqwdqd {
              width: 100%;
              .px2heightcalc(50%, 1);
              display: flex;
              align-items: center;
              padding: 0 13px;
              box-sizing: border-box;
            }

            .qfwdqwdqwdqd {
              justify-content: space-between;

              > span:first-child {
                .px2font(16);
                font-weight: bold;
              }

              > span:last-child {
                color: rgba(255, 255, 255, 0.62);
              }
            }

            .qwdehqwiouhfuoew {
              color: #b4daff;
            }

            .divider-line {
              width: 80%;
              height: 1px;
              background-color: rgba(255, 255, 255, 0.48); // 半透明白线，可改色
            }

            .qfwdqwdqwdqd {
              width: 100%;
              .px2heightcalc(50%, 1);
            }
          }
        }
      }
    }

    .left-btm {
      position: relative;
      width: 100%;
      height: 65%;
      display: flex;
      flex-direction: column;
      align-items: center;

      img {
        .px2vw(width, 325);
        .px2vh(height, 28);
      }

      .bar-chart,
      .pie-chart {
        width: 100%;
        .px2heightcalc(50%, 14);
      }
      .bar-filter {
        position: absolute;
        top: 0;
        right: 0;

        .select-filter {
          cursor: pointer;
          position: relative;
          z-index: 2;
          .select-area {
            position: absolute;
            z-index: 999;
            .px2vh_vw(top, 30);
            left: 0;
            background-color: #2a3235;
            border-radius: 5px;
            box-sizing: border-box;
            .px2vw(width, 110);
            .px2padding(6, 6);
            overflow: hidden;
            .select-item {
              width: 100%;
              .px2vw(padding-left, 10);
            }
            .select-item:hover {
              background-color: rgba(0, 0, 0, 0.8);
            }
          }
          .px2vw(width, 94);
          .px2vh_vw(height, 32);
          .px2font(14);
          .px2vw(padding-left, 10);
          .px2vh_vw(line-height, 28);
          .px2vh_vw(margin-top, 28);
          border: 1px solid #738492;
          box-sizing: border-box;
          cursor: pointer;
          box-sizing: border-box;
          background-color: rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          background-repeat: no-repeat;
          background-size: cover;
          i {
            position: absolute;
            z-index: 1;
            top: 6px;
            right: 6px;
            color: #ccc;
          }
        }
      }
      .bar-chart {
      }

      .pie-chart {
      }
    }
  }

  .middle {
    .px2vw(margin-left, 20);
    .px2vw(margin-right, 20);
    .px2vw(width, 1200);
    height: 100%;
    position: relative;
    box-sizing: border-box;
    // background-color: rgba(0, 255, 251, 0.3);

    .crew-two {
      .px2vh(top, 360);
      // .px2vw(left, 246);
      left: 21%;
    }

    .crew-two.active {
      left: 18%;
    }

    .crew-one {
      .px2vh(top, 360);
      // .px2vw(left, 338);
      left: 29.6%;
    }

    .crew-one.active {
      left: 27%;
    }

    .crew-four {
      .px2vh(top, 360);
      // .px2vw(left, 540);
      left: 47%;
    }

    .crew-three {
      .px2vh(top, 360);
      left: 55%;
    }

    .crew-three.active {
      left: 56%;
    }

    .crew-six {
      .px2vh(top, 360);
      // .px2vw(left, 818);
      left: 71%;
    }

    .crew-six.active {
      left: 74%;
    }

    .crew-five {
      .px2vh(top, 360);
      // .px2vw(left, 910);
      left: 79.2%;
    }

    .crew-five.active {
      left: 83%;
    }

    .crew-area {
      position: absolute;
      .px2vw(width, 80);
      cursor: pointer;

      img {
        width: 100%;
      }
    }

    .crew-area img:first-child {
      display: block;
      /* 第一张图片正常显示 */
    }

    .crew-area img:last-child {
      display: none;
      /* 第二张图片默认隐藏 */
    }

    /* 当鼠标悬停在 .crew-area 上时：隐藏第一张图片，显示第二张图片 */
    .crew-area:hover img:first-child {
      display: none;
      /* 悬停时隐藏 two.png */
    }

    .crew-area:hover img:last-child {
      display: block;
      /* 悬停时显示 twohover.png */
    }
  }

  .middle-filter {
    .px2mlr(20);
    width: 64%;
    height: 100%;
    position: relative;
    box-sizing: border-box;
    // background-color: rgba(0, 0, 0, 0.2);
    z-index: 2;
  }

  .right {
    width: 19%;
    height: 100%;
    padding: 1%;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    .px2font(12);

    // justify-content: center;
    img {
      .px2vw(width, 325);
      .px2vh(height, 28);
    }

    .right-top {
      width: 100%;
      height: 50%;

      .owehfiwejn {
        width: 100%;
        .px2vh(height, 110);
        .px2margin(8, 0);
        .px2padding(10, 20);
        box-sizing: border-box;
        border-radius: 7px;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .qwoudhuoqw {
          width: calc(25% - 1px);
          height: calc(50% - 1px);
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;

          > span:first-child {
            color: rgba(255, 255, 255, 0.78);
            .px2font(12);
            transform: scale(0.9);
            font-style: normal;
            font-weight: 400;
          }

          > span:last-child {
            color: #fff;
            .px2font(16);
            font-style: normal;
            font-weight: bold;
          }
        }
      }

      .alarm-list-container {
        width: 100%;
        .px2heightcalc(100%, 166);
        overflow: hidden;
        display: flex;
        flex-direction: column;

        // border: 1px solid white;
        // box-sizing: border-box;
        .list-header {
          display: grid;
          grid-template-columns: 1.3fr 0.8fr 2fr; // 三列等宽
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 2px 2px 0 0;
          .px2padding(3, 5);
          box-sizing: border-box;
          color: #fff;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);

          .col-device,
          .col-type,
          .col-time {
            .px2font(12);
            transform: scale(0.9);
          }
        }

        .list-scroll {
          flex: 1;
          overflow-y: auto; // 垂直滚动
          // padding-right: 8px;

          // 自定义滚动条样式（匹配截图右侧细白滚动条）
          &::-webkit-scrollbar {
            .px2vwimp(2);
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.6);
            border-radius: 2px;
          }

          &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            .px2vwimp(2);
            // background: transparent;
          }

          .list-item {
            display: grid;
            grid-template-columns: 1.3fr 0.8fr 2fr; // 三列等宽
            .px2padding(3, 2);
            box-sizing: border-box;
            .px2font(12);
            // border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            background-color: rgba(0, 0, 0, 0.3);
            .px2margin(2, 0);
            text-align: center;
            align-items: center;

            .col-device {
              .px2font(12);
              transform: scale(0.8);
              color: #fff;
            }

            .col-type,
            .col-time {
              .px2font(12);
              transform: scale(0.8);
              color: rgba(255, 255, 255, 0.8);
            }

            // 前2项高亮（橙色，匹配截图）
            &.highlight {
              .col-device {
                color: #ff6a00; // 橙色高亮
                font-weight: 500;
              }
            }
          }
        }
      }
    }

    .right-btm {
      width: 100%;
      height: 50%;

      .alarm-list-container {
        width: 100%;
        .px2heightcalc(100%, 28);
        overflow: hidden;
        display: flex;
        flex-direction: column;

        // border: 1px solid white;
        // box-sizing: border-box;
        .list-header {
          display: grid;
          grid-template-columns: 1.3fr 1.2fr; // 三列等宽
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 2px 2px 0 0;
          .px2padding(3, 5);
          box-sizing: border-box;
          .px2font(12);
          color: #fff;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);

          .col-device,
          .col-type,
          .col-time {
            transform: scale(0.9);
          }
        }

        .list-scroll {
          flex: 1;
          overflow-y: auto; // 垂直滚动
          // padding-right: 8px;

          // 自定义滚动条样式（匹配截图右侧细白滚动条）
          &::-webkit-scrollbar {
            .px2vwimp(2);
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.6);
            // border-radius: 2px;
          }

          &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            .px2vwimp(2);
            // background: transparent;
          }

          .list-item {
            display: grid;
            grid-template-columns: 1.3fr 1.2fr; // 三列等宽
            .px2padding(3, 5);
            .px2font(12);
            // border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            background-color: rgba(0, 0, 0, 0.3);
            margin: 2px 0;
            text-align: center;
            align-items: center;
            overflow: hidden;

            /* 👇 设备编号：超出宽度自动显示 ... */
            .col-device {
              color: #fff;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              transform: scale(0.8);
            }

            .col-type,
            .col-time {
              color: rgba(255, 255, 255, 0.8);
              transform: scale(0.8);
            }

            // 前2项高亮（橙色，匹配截图）
            &.highlight {
              .col-device {
                color: #ff6a00; // 橙色高亮
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}
</style>
