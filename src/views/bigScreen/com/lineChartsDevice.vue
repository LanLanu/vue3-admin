<template>
  <div class="chart-container">
    <div ref="chart" class="chart"></div>
  </div>
</template>

<script scoped>
import * as echarts from "echarts";

export default {
  name: "MonitorChart",
  props: {
    checkList: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      myChart: null,
      // 缓存完整的series配置（避免重复创建）
      fullSeriesConfig: [],
      // 映射关系：名称 → Y轴索引/系列索引/数据key
      chartMap: {
        "CO₂": { yAxisIndex: 0, seriesIndex: 0, dataKey: "co2" },
        湿度: { yAxisIndex: 1, seriesIndex: 1, dataKey: "humidity" },
        温度: { yAxisIndex: 2, seriesIndex: 2, dataKey: "temp" },
        "PM2.5": { yAxisIndex: 3, seriesIndex: 3, dataKey: "pm25" },
        电磁干扰: { yAxisIndex: 4, seriesIndex: 4, dataKey: "emi" },
        静电干扰: { yAxisIndex: 5, seriesIndex: 5, dataKey: "static" }
      },
      times: [
        "12:00:00",
        "12:00:03",
        "12:00:06",
        "12:00:09",
        "12:00:12",
        "12:00:15",
        "12:00:18",
        "12:00:21",
        "12:00:24",
        "12:00:27",
        "12:00:30",
        "12:00:33",
        "12:00:36",
        "12:00:39",
        "12:00:42"
      ],
      dataList: {
        co2: [
          60,
          180,
          230,
          260,
          330,
          390,
          350,
          230,
          220,
          180,
          150,
          120,
          60,
          60,
          60
        ],
        humidity: [
          260,
          265,
          270,
          272,
          275,
          280,
          275,
          290,
          295,
          293,
          292,
          290,
          288,
          286,
          285
        ],
        temp: [
          300,
          330,
          345,
          350,
          360,
          375,
          365,
          460,
          220,
          215,
          218,
          210,
          195,
          192,
          190
        ],
        pm25: [
          80,
          100,
          270,
          220,
          360,
          390,
          310,
          290,
          220,
          100,
          190,
          150,
          90,
          10,
          60
        ],
        emi: [
          60,
          90,
          120,
          115,
          160,
          180,
          160,
          230,
          245,
          235,
          225,
          215,
          190,
          188,
          185
        ],
        static: [
          160,
          80,
          260,
          60,
          300,
          90,
          50,
          230,
          290,
          100,
          150,
          100,
          60,
          160,
          60
        ]
      }
    };
  },
  mounted() {
    this.initChart();
    window.addEventListener("resize", this.resizeChart);
  },
  beforeDestroy() {
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
    window.removeEventListener("resize", this.resizeChart);
  },
  methods: {
    initChart() {
      const chartDom = this.$refs.chart;
      this.myChart = echarts.init(chartDom);
      // 初始化时缓存完整的series配置
      this.fullSeriesConfig = this.getFullSeriesConfig();
      const option = this.getChartOption();
      this.myChart.setOption(option);
    },
    getFullSeriesConfig() {
      return [
        // CO₂ - 绑定左侧第1个Y轴（yAxisIndex: 0）
        {
          name: "CO₂",
          type: "line",
          smooth: true,
          symbol: "none",
          yAxisIndex: 0, // 关键：指定使用第0个Y轴
          lineStyle: { width: 2, color: "#d946ef" },
          data: this.dataList.co2,
          show: this.checkList.includes("CO₂")
        },
        // 湿度 - 绑定左侧第2个Y轴（yAxisIndex: 1）
        {
          name: "湿度",
          type: "line",
          smooth: true,
          symbol: "none",
          yAxisIndex: 1,
          lineStyle: { width: 2, color: "#4ade80" },
          data: this.dataList.humidity,
          show: this.checkList.includes("湿度")
        },
        // 温度 - 绑定左侧第3个Y轴（yAxisIndex: 2）
        {
          name: "温度",
          type: "line",
          smooth: true,
          symbol: "none",
          yAxisIndex: 2,
          lineStyle: { width: 2, color: "#67e8f9" },
          data: this.dataList.temp,
          show: this.checkList.includes("温度"),
          markPoint: {
            symbol: "triangle",
            symbolSize: 15,
            data: [{ name: "预警", coord: ["12:00:21", 460] }],
            itemStyle: { color: "#f97316" },
            label: {
              show: true,
              position: "top",
              formatter: "预警",
              color: "#f97316",
              fontSize: 13,
              offset: [0, -30]
            }
          },
          markLine: {
            symbol: "none",
            lineStyle: { color: "#ffffff", type: "dashed" },
            data: [{ xAxis: "12:00:21" }],
            label: {
              show: false
            }
          }
        },
        // PM2.5 - 绑定右侧第1个Y轴（yAxisIndex: 3）
        {
          name: "PM2.5",
          type: "line",
          smooth: true,
          symbol: "none",
          yAxisIndex: 3,
          lineStyle: { width: 2, color: "#3b82f6" },
          data: this.dataList.pm25,
          show: this.checkList.includes("PM2.5")
        },
        // 电磁干扰 - 绑定右侧第2个Y轴（yAxisIndex: 4）
        {
          name: "电磁干扰",
          type: "line",
          smooth: true,
          symbol: "none",
          yAxisIndex: 4,
          lineStyle: { width: 2, color: "#fbbf24" },
          data: this.dataList.emi,
          show: this.checkList.includes("电磁干扰")
        },
        // 静电干扰 - 绑定右侧第3个Y轴（yAxisIndex: 5）
        {
          name: "静电干扰",
          type: "line",
          smooth: true,
          symbol: "none",
          yAxisIndex: 5,
          lineStyle: { width: 2, color: "#ef4444" },
          data: this.dataList.static,
          show: this.checkList.includes("静电干扰")
        }
      ];
    },
    getChartOption() {
      // 初始化series：根据checkList过滤
      const initSeries = this.fullSeriesConfig.map(item => {
        return {
          ...item,
          // 显示则保留数据，隐藏则清空数据（核心修复）
          data: this.checkList.includes(item.name) ? item.data : []
        };
      });
      return {
        backgroundColor: "#0e1112",
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(57, 67, 82, 0.9)", // 深色半透明背景，和你图里一致
          borderColor: "transparent",
          borderRadius: 4,
          padding: 12,
          // 关键：允许tooltip渲染HTML字符串
          dangerouslyUseHTMLString: true,
          formatter: function (params) {
            // 自定义提示框的HTML结构，完全还原你图里的样式
            const tempList = params.map(item => {
              let color = "";
              switch (item.seriesName) {
                case "CO₂":
                  color = "#d946ef";
                  break;
                case "湿度":
                  color = "#4ade80";
                  break;
                case "温度":
                  color = "#67e8f9";
                  break;
                case "PM2.5":
                  color = "#3b82f6";
                  break;
                case "电磁干扰":
                  color = "#fbbf24";
                  break;
                case "静电干扰":
                  color = "#ef4444";
                  break;
              }
              return { ...item, color };
            });
            let html = "";
            tempList.forEach(item => {
              html += `
              <div style="display: flex; line-height: 28px; min-width: 120px;">
                <span style="color: #ccc; font-size: 13px;min-width: 70px;">${item.seriesName}</span>
                <span style="color: ${item.color}; font-size: 13px; font-weight: bold;margin-right: 0px;">${item.value}</span>
              </div>
            `;
            });
            return html;
          }
        },
        legend: {
          show: false // 隐藏默认图例，用Y轴标签替代
        },
        grid: {
          top: "12%", // 给左侧3个Y轴留空间
          left: "4%", // 给左侧3个Y轴留空间
          right: "6%", // 给右侧3个Y轴留空间
          bottom: "10%",
          containLabel: true
        },
        // 核心：配置6个Y轴（左3+右3）
        yAxis: [
          // 左侧第1个Y轴 - CO₂
          {
            type: "value",
            name: "CO₂",
            nameTextStyle: {
              color: "#d946ef",
              fontSize: 13,
              padding: [0, 0, 0, 6]
            },
            min: 0,
            max: 500,
            position: "left",
            offset: 100, // 偏移量，避免重叠
            axisLine: { lineStyle: { color: "#d946ef" } },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: "#333" } },
            axisLabel: { color: "#d946ef", align: "left", fontSize: 13 },
            show: this.checkList.includes("CO₂")
          },
          // 左侧第2个Y轴 - 湿度
          {
            type: "value",
            name: "湿度",
            nameTextStyle: {
              color: "#4ade80",
              padding: [0, 0, 0, 6],
              fontSize: 13
            },
            min: 0,
            max: 500,
            position: "left",
            offset: 60,
            axisLine: { lineStyle: { color: "#4ade80" } },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: "#333" } },
            axisLabel: { color: "#4ade80", align: "left", fontSize: 13 },
            show: this.checkList.includes("湿度")
          },
          // 左侧第3个Y轴 - 温度
          {
            type: "value",
            name: "温度",
            nameTextStyle: {
              color: "#67e8f9",
              padding: [0, 0, 0, 6],
              fontSize: 13
            },
            min: 0,
            max: 500,
            position: "left",
            offset: 20,
            axisLine: { lineStyle: { color: "#67e8f9" } },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: "#333" } },
            axisLabel: { color: "#67e8f9", align: "left", fontSize: 13 },
            show: this.checkList.includes("温度")
          },
          // 右侧第1个Y轴 - PM2.5
          {
            type: "value",
            name: "PM2.5",
            nameTextStyle: {
              color: "#3b82f6",
              padding: [0, 0, 0, 30],
              fontSize: 13
            },
            min: 0,
            max: 500,
            position: "right",
            offset: 0,
            axisLine: { lineStyle: { color: "#3b82f6" } },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: "#333" } },
            axisLabel: { color: "#3b82f6", fontSize: 13 },
            show: this.checkList.includes("PM2.5")
          },
          // 右侧第2个Y轴 - 电磁干扰
          {
            type: "value",
            name: "电磁干扰",
            nameTextStyle: {
              color: "#fbbf24",
              padding: [0, 0, 0, 40],
              fontSize: 13
            },
            min: 0,
            max: 500,
            position: "right",
            offset: 46,
            axisLine: { lineStyle: { color: "#fbbf24" } },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: "#333" } },
            axisLabel: { color: "#fbbf24", align: "left", fontSize: 13 },
            show: this.checkList.includes("电磁干扰")
          },
          // 右侧第3个Y轴 - 静电干扰
          {
            type: "value",
            name: "静电干扰",
            nameTextStyle: {
              color: "#ef4444",
              padding: [0, 0, 0, 50],
              fontSize: 13
            },
            min: 0,
            max: 500,
            position: "right",
            offset: 100,
            axisLine: { lineStyle: { color: "#ef4444" } },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: "#333" } },
            axisLabel: { color: "#ef4444", align: "left", fontSize: 13 },
            show: this.checkList.includes("静电干扰")
          }
        ],
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.times,
          axisLine: { lineStyle: { color: "#555" } },
          axisLabel: {
            color: "#fff",
            fontSize: 12,
            margin: 20,
            // 2. 文字水平对齐方式，第一个标签可以设置为 'left'
            align: "center"
          },
          axisTick: { show: false }
        },
        series: initSeries,
        dataZoom: [
          {
            type: "slider",
            show: true,
            moveHandleSize: 0,
            start: 0,
            end: 100,
            height: 20,
            bottom: 10,
            backgroundColor: "#222",
            borderColor: "#333",
            showHandles: false,
            showDetail: false,
            fillerColor: "rgba(59, 130, 246, 0.3)",
            // handleStyle: { color: "#fff", borderColor: "#3b82f6" },
            // 🔹 3. 滑块手柄（两端的拖动块）
            handleStyle: {
              color: "#f2f2f2", // 滑块主体颜色
              borderColor: "#7fa3f8", // 滑块边框
              borderWidth: 2,
              // shadowBlur: 4, // 阴影大小
              shadowColor: "rgba(0,0,0,0.5)"
            },

            // 🔹 4. 滑块手柄的大小、形状
            handleSize: "100%", // 滑块高度占比
            handleIcon: `
      M25,25 H75 V75 H25 Z
      M50,0 V100
    `,
            // . 滑动条内部的预览曲线样式
            dataBackground: {
              // seriesIndex: 0, // 只预览第0条系列（CO₂线）
              lineStyle: {
                color: "#4164f5", // 预览曲线颜色
                width: 2
              },
              areaStyle: {
                color: "rgba(34, 197, 94, 0.1)" // 曲线下方填充色
              }
            },
            // . 未选中区域的颜色（滑块外的部分）
            emptyDataBackground: {
              // seriesIndex: 0,
              lineStyle: {
                color: "#4164f5", // 灰色预览线
                width: 2
              },
              areaStyle: {
                color: "#ffffff"
              }
            }
          }
        ]
      };
    },
    resizeChart() {
      this.myChart && this.myChart.resize();
    },
    updateChartByCheckList() {
      if (!this.myChart) return;
      this.myChart && this.myChart.dispose();
      this.initChart();
    }
  },
  watch: {
    checkList: {
      handler(val) {
        console.log("数组变了", val);
        if (!val.length) {
          this.myChart && this.myChart.dispose();
        } else {
          this.updateChartByCheckList();
        }
      },
      deep: true
    }
  }
};
</script>

<style scoped lang="less">
@import "../css/utils.less";

.chart-container {
  width: 100%;
  .px2vh_vw(height, 400);
  background-color: #0e1112;

  .chart {
    width: 100%;
    .px2vh_vw(height, 400);
    background-color: #0e1112;
  }
}
</style>
