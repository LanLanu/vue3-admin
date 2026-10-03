<template>
  <div class="console-page">
    <!-- 左侧：hero 访问总数 -->
    <div class="hero-card">
      <div class="hero-bg"></div>
      <div class="hero-inner">
        <div class="hero-icon-wrap">
          <el-icon><Checked /></el-icon>
        </div>
        <div class="hero-label">访问总数</div>
        <div class="hero-num">{{ totalVisits.toFixed(2) }}</div>
        <!-- 底部小折线 -->
        <div class="hero-mini-chart">
          <div ref="miniChartRef" class="mini-chart"></div>
        </div>
      </div>
    </div>

    <!-- 右侧 -->
    <div class="right-panel">
      <!-- 四个小卡片 -->
      <div class="stat-row">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="stat-card"
          :class="`stat-card--${card.skin}`"
        >
          <div class="stat-card__icon">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-card__val">{{ card.value }}</div>
          <div class="stat-card__label">{{ card.label }}</div>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="chart-panel">
        <div class="chart-panel__title">Gitee / GitHub 访问量占比</div>
        <div class="chart-panel__body">
          <!-- 图例 -->
          <div class="legend">
            <div class="legend-item">
              <span class="legend-dot" style="background: #ff9f43"></span>
              <span class="legend-text">Gitee 访问量</span>
              <span class="legend-num">{{ giteeVal }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #8b5cf6"></span>
              <span class="legend-text">GitHub 访问量</span>
              <span class="legend-num">{{ githubVal }}</span>
            </div>
          </div>
          <!-- 饼图 -->
          <div ref="pieRef" class="pie-wrap"></div>
        </div>
      </div>

      <!-- 底部条形统计图 -->
      <div class="bar-panel">
        <div class="chart-panel__title">近 10 日访问趋势</div>
        <div ref="barRef" class="bar-wrap"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import {
  Checked,
  TrendCharts,
  DocumentChecked,
  Monitor,
  User,
} from "@element-plus/icons-vue";

// ─── 模拟数据（10 秒，每秒一条）──────────────────────────
const initialData = {
  times: [
    "00:00",
    "00:01",
    "00:02",
    "00:03",
    "00:04",
    "00:05",
    "00:06",
    "00:07",
    "00:08",
    "00:09",
  ],
  // 初始 10 条数据
  gitee: [3200, 3500, 3100, 3800, 4200, 4000, 4300, 4100, 4500, 5000],
  github: [2800, 3100, 3300, 2900, 3600, 3800, 3500, 3900, 3700, 5000],
  total: 848.13,
};

const giteeHistory = ref([...initialData.gitee]);
const githubHistory = ref([...initialData.github]);
const timesHistory = ref([...initialData.times]);
const totalVisits = ref(initialData.total);

// 当前最新值（用于饼图）
const giteeVal = computed(
  () => giteeHistory.value[giteeHistory.value.length - 1],
);
const githubVal = computed(
  () => githubHistory.value[githubHistory.value.length - 1],
);

// ─── 小卡片配置 ───────────────────────────────────────
const statCards = ref([
  {
    key: "gitee",
    skin: "green",
    icon: User,
    value: giteeVal,
    label: "Gitee 访问量",
  },
  {
    key: "github",
    skin: "purple",
    icon: TrendCharts,
    value: githubVal,
    label: "GitHub 访问量",
  },
  {
    key: "today",
    skin: "orange",
    icon: DocumentChecked,
    value: ref(4567),
    label: "今日访问量",
  },
  {
    key: "yesterday",
    skin: "blue",
    icon: Monitor,
    value: ref(1234),
    label: "昨日访问量",
  },
]);

// ─── ECharts 实例 ─────────────────────────────────────
const pieRef = ref(null);
const barRef = ref(null);
const miniChartRef = ref(null);
let pieChart = null;
let barChart = null;
let miniChart = null;

// ─── 通用配色 ─────────────────────────────────────────
const C = {
  gitee: "#FF9F43",
  github: "#8B5CF6",
  line: "#2d96f1",
  area: "rgba(45,150,241,0.12)",
  grid: "#f0f2f5",
  text: "#888",
};

// ─── 初始化饼图 ───────────────────────────────────────
function initPie() {
  pieChart = echarts.init(pieRef.value);
  pieChart.setOption({
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    series: [
      {
        type: "pie",
        radius: ["52%", "78%"],
        center: ["50%", "52%"],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: false } },
        data: [
          {
            value: giteeVal.value,
            name: "Gitee",
            itemStyle: { color: C.gitee },
          },
          {
            value: githubVal.value,
            name: "GitHub",
            itemStyle: { color: C.github },
          },
        ],
      },
    ],
  });
}

// ─── 初始化条形图 ─────────────────────────────────────
function initBar() {
  barChart = echarts.init(barRef.value);
  barChart.setOption(getBarOption());
}

function getBarOption() {
  return {
    tooltip: { trigger: "axis" },
    legend: {
      show: false,
    },
    grid: { top: 10, right: 20, bottom: 28, left: 48 },
    xAxis: {
      type: "category",
      data: timesHistory.value,
      axisLine: { lineStyle: { color: C.grid } },
      axisTick: { show: false },
      axisLabel: { color: C.text, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: C.grid, type: "dashed" } },
      axisLabel: { color: C.text, fontSize: 11 },
    },
    series: [
      {
        name: "Gitee",
        type: "bar",
        barWidth: "30%",
        itemStyle: { color: C.gitee, borderRadius: [4, 4, 0, 0] },
        data: giteeHistory.value,
      },
      {
        name: "GitHub",
        type: "bar",
        barWidth: "30%",
        itemStyle: { color: C.github, borderRadius: [4, 4, 0, 0] },
        data: githubHistory.value,
      },
    ],
  };
}

// ─── 初始化迷你折线图（hero 卡片底部）──────────────────
function initMiniChart() {
  miniChart = echarts.init(miniChartRef.value);
  const miniData = [120, 132, 101, 134, 90, 230, 210, 180, 200, 250];
  miniChart.setOption({
    grid: { top: 4, right: 0, bottom: 0, left: 0 },
    xAxis: {
      type: "category",
      show: false,
      data: Array.from({ length: 10 }, (_, i) => i),
    },
    yAxis: { type: "value", show: false },
    series: [
      {
        type: "line",
        data: miniData,
        smooth: true,
        symbol: "none",
        lineStyle: { color: "rgba(255,255,255,0.7)", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(255,255,255,0.25)" },
              { offset: 1, color: "rgba(255,255,255,0)" },
            ],
          },
        },
      },
    ],
  });
}

// ─── 每秒更新数据 ─────────────────────────────────────
let timer = null;
function startUpdate() {
  timer = setInterval(() => {
    // 生成下一跳数据
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const gNext = Math.floor(Math.random() * 2000) + 3500;
    const ghNext = Math.floor(Math.random() * 2000) + 3000;

    giteeHistory.value.push(gNext);
    githubHistory.value.push(ghNext);
    timesHistory.value.push(ts);

    // 超出 10 条就丢弃最早的
    if (giteeHistory.value.length > 10) {
      giteeHistory.value.shift();
      githubHistory.value.shift();
      timesHistory.value.shift();
    }

    // 更新总量（叠加当前增量）
    totalVisits.value = parseFloat(
      (totalVisits.value + (gNext + ghNext) * 0.01).toFixed(2),
    );

    // 刷新图表
    pieChart.setOption({
      series: [
        {
          data: [
            { value: gNext, name: "Gitee", itemStyle: { color: C.gitee } },
            { value: ghNext, name: "GitHub", itemStyle: { color: C.github } },
          ],
        },
      ],
    });
    barChart.setOption(getBarOption());
  }, 1000);
}

// ─── 生命周期 ─────────────────────────────────────────
onMounted(() => {
  initPie();
  initBar();
  initMiniChart();
  startUpdate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  clearInterval(timer);
  window.removeEventListener("resize", handleResize);
  pieChart?.dispose();
  barChart?.dispose();
  miniChart?.dispose();
});

function handleResize() {
  pieChart?.resize();
  barChart?.resize();
  miniChart?.resize();
}
</script>

<style scoped lang="scss">
// ─── 页面布局 ─────────────────────────────────────────
.console-page {
  display: flex;
  gap: 16px;
  align-items: stretch;
  height: 100%;
  box-sizing: border-box;
  padding: 4px;
}

// ─── Hero 大卡片 ──────────────────────────────────────
.hero-card {
  position: relative;
  flex-shrink: 0;
  width: 280px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(45, 150, 241, 0.22);
  // 蓝色渐变背景与右侧卡片等高
  display: flex;
  flex-direction: column;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #1a6fd4 0%, #2d96f1 45%, #7ec8f8 100%);
  z-index: 0;
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 35%;
    background: linear-gradient(to top, rgba(255, 255, 255, 0.1), transparent);
    border-radius: 0 0 20px 20px;
  }
}

.hero-inner {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px 16px;
  color: #fff;
}

.hero-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);

  i {
    font-size: 28px;
    color: #5b7ff5;
  }
}

.hero-label {
  font-size: 14px;
  opacity: 0.88;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.hero-num {
  font-size: 52px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -1px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

// 迷你折线图容器
.hero-mini-chart {
  margin-top: auto;
  width: 100%;
  height: 60px;
}

.mini-chart {
  width: 100%;
  height: 100%;
}

// ─── 右侧面板 ─────────────────────────────────────────
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

// ─── 统计卡片行 ───────────────────────────────────────
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  flex-shrink: 0;
}

.stat-card {
  border-radius: 16px;
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.5;
    z-index: 0;
    border-radius: 16px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  // 四种配色
  &--green {
    background: linear-gradient(145deg, #e8f8ef, #c8ecd8);
  }
  &--purple {
    background: linear-gradient(145deg, #f0ecfb, #dcc9f7);
  }
  &--orange {
    background: linear-gradient(145deg, #fef4e8, #fde0c0);
  }
  &--blue {
    background: linear-gradient(145deg, #eaf4fd, #d0e8f7);
  }

  &__icon {
    position: relative;
    z-index: 1;
    width: 50px;
    height: 50px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    background: rgba(255, 255, 255, 0.6);

    i,
    .el-icon {
      font-size: 22px;
    }
  }

  &__val {
    position: relative;
    z-index: 1;
    font-size: 26px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  &__label {
    position: relative;
    z-index: 1;
    font-size: 12px;
    color: #666;
  }
}

// ─── 图表通用面板 ─────────────────────────────────────
.chart-panel,
.bar-panel {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.chart-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20px;
    min-height: 0;
  }
}

.bar-panel {
  flex-shrink: 0;
  height: 200px;

  &.__title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 12px;
  }
}

// ─── 图例 ─────────────────────────────────────────────
.legend {
  flex-shrink: 0;
  width: 148px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legend-dot {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .legend-text {
    flex: 1;
    font-size: 13px;
    color: #666;
  }

  .legend-num {
    font-size: 13px;
    color: #999;
    font-weight: 500;
  }
}

// ─── 饼图容器 ─────────────────────────────────────────
.pie-wrap {
  flex: 1;
  min-width: 0;
  height: 180px;
}

// ─── 条形图容器 ───────────────────────────────────────
.bar-wrap {
  width: 100%;
  height: 100%;
}
</style>
