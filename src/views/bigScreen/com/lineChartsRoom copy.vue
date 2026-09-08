<template>
  <div class="chart-container">
    <div ref="chart" class="chart"></div>
    <div class="title">默认24小时记录</div>
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
    },
    tipFlag: {
      type: Boolean,
      default: true
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
      // 8:00:00 到 12:00:00，每3分钟一个时间点（共81个）
      times: [
        "08:00:00",
        "08:03:00",
        "08:06:00",
        "08:09:00",
        "08:12:00",
        "08:15:00",
        "08:18:00",
        "08:21:00",
        "08:24:00",
        "08:27:00",
        "08:30:00",
        "08:33:00",
        "08:36:00",
        "08:39:00",
        "08:42:00",
        "08:45:00",
        "08:48:00",
        "08:51:00",
        "08:54:00",
        "08:57:00",
        "09:00:00",
        "09:03:00",
        "09:06:00",
        "09:09:00",
        "09:12:00",
        "09:15:00",
        "09:18:00",
        "09:21:00",
        "09:24:00",
        "09:27:00",
        "09:30:00",
        "09:33:00",
        "09:36:00",
        "09:39:00",
        "09:42:00",
        "09:45:00",
        "09:48:00",
        "09:51:00",
        "09:54:00",
        "09:57:00",
        "10:00:00",
        "10:03:00",
        "10:06:00",
        "10:09:00",
        "10:12:00",
        "10:15:00",
        "10:18:00",
        "10:21:00",
        "10:24:00",
        "10:27:00",
        "10:30:00",
        "10:33:00",
        "10:36:00",
        "10:39:00",
        "10:42:00",
        "10:45:00",
        "10:48:00",
        "10:51:00",
        "10:54:00",
        "10:57:00",
        "11:00:00",
        "11:03:00",
        "11:06:00",
        "11:09:00",
        "11:12:00",
        "11:15:00",
        "11:18:00",
        "11:21:00",
        "11:24:00",
        "11:27:00",
        "11:30:00",
        "11:33:00",
        "11:36:00",
        "11:39:00",
        "11:42:00",
        "11:45:00",
        "11:48:00",
        "11:51:00",
        "11:54:00",
        "11:57:00",
        "12:00:00"
      ],
      // 81个数据点，严格匹配指定数值范围，高频波动
      dataList: {
        co2: [
          45,
          44,
          43,
          44,
          45,
          46,
          45,
          44,
          43,
          42,
          41,
          42,
          43,
          44,
          45,
          46,
          45,
          44,
          43,
          42,
          41,
          40,
          41,
          42,
          43,
          78,
          12,
          50,
          15,
          50,
          18,
          56,
          20,
          60,
          25,
          55,
          30,
          50,
          35,
          45,
          44,
          43,
          44,
          45,
          46,
          45,
          44,
          43,
          42,
          41,
          40,
          41,
          42,
          43,
          44,
          45,
          44,
          43,
          42,
          41,
          40,
          41,
          42,
          43,
          44,
          45,
          44,
          43,
          42,
          41,
          40,
          41,
          42,
          43,
          44,
          45,
          44,
          43,
          42,
          41,
          40
        ],
        humidity: [
          150,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          155,
          154,
          153,
          154,
          153,
          152,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          152,
          151,
          150,
          151,
          155,
          154,
          153,
          152,
          153,
          154,
          152,
          158,
          120,
          145,
          125,
          160,
          130,
          155,
          135,
          150,
          140,
          165,
          145,
          170,
          150,
          155,
          154,
          153,
          154,
          153,
          152,
          153,
          154,
          152,
          151,
          150
        ],
        temp: [
          250,
          251,
          250,
          251,
          252,
          251,
          250,
          251,
          252,
          251,
          250,
          251,
          252,
          251,
          250,
          251,
          252,
          251,
          250,
          257,
          256,
          255,
          256,
          257,
          256,
          255,
          256,
          257,
          256,
          255,
          256,
          257,
          256,
          255,
          256,
          257,
          251,
          252,
          251,
          250,
          251,
          252,
          298,
          225,
          275,
          230,
          250,
          235,
          255,
          240,
          240,
          245,
          265,
          250,
          270,
          255,
          260,
          259,
          258,
          259,
          260,
          259,
          258,
          259,
          260,
          259,
          258,
          257,
          258,
          259,
          258,
          257,
          258,
          259,
          258,
          257,
          256,
          255,
          256,
          256,
          255
        ],
        pm25: [
          340,
          341,
          340,
          341,
          342,
          341,
          340,
          343,
          344,
          345,
          344,
          343,
          342,
          343,
          344,
          343,
          342,
          343,
          344,
          343,
          342,
          341,
          340,
          341,
          342,
          341,
          340,
          341,
          342,
          341,
          340,
          341,
          342,
          341,
          340,
          341,
          342,
          341,
          341,
          342,
          341,
          340,
          341,
          342,
          341,
          340,
          341,
          342,
          341,
          340,
          341,
          342,
          341,
          340,
          341,
          342,
          369,
          322,
          368,
          323,
          347,
          324,
          366,
          325,
          365,
          326,
          344,
          327,
          353,
          328,
          345,
          344,
          343,
          344,
          345,
          344,
          340,
          341,
          342,
          341,
          340
        ],
        emi: [
          415,
          416,
          415,
          416,
          396,
          438,
          397,
          417,
          398,
          416,
          399,
          435,
          400,
          434,
          401,
          433,
          402,
          418,
          417,
          416,
          417,
          418,
          417,
          416,
          417,
          418,
          417,
          416,
          415,
          416,
          417,
          416,
          415,
          416,
          417,
          416,
          415,
          414,
          413,
          414,
          415,
          417,
          416,
          415,
          416,
          417,
          416,
          415,
          416,
          417,
          416,
          415,
          416,
          417,
          416,
          415,
          416,
          417,
          416,
          415,
          416,
          417,
          411,
          414,
          413,
          414,
          415,
          414,
          413,
          414,
          415,
          414,
          413,
          414,
          415,
          414,
          413,
          414,
          415,
          414,
          413
        ],
        static: [
          480,
          481,
          480,
          481,
          482,
          481,
          480,
          481,
          483,
          482,
          483,
          484,
          483,
          482,
          483,
          484,
          483,
          482,
          481,
          480,
          481,
          482,
          481,
          480,
          481,
          482,
          482,
          481,
          480,
          481,
          482,
          481,
          480,
          481,
          482,
          481,
          480,
          481,
          482,
          481,
          480,
          481,
          482,
          490,
          461,
          479,
          462,
          468,
          463,
          497,
          464,
          496,
          465,
          495,
          466,
          494,
          467,
          485,
          484,
          483,
          484,
          485,
          484,
          483,
          484,
          485,
          484,
          481,
          480,
          481,
          482,
          481,
          480,
          481,
          482,
          481,
          480,
          481,
          482,
          481,
          480
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
          smooth: false,
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
          smooth: false,
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
          smooth: false,
          symbol: "none",
          yAxisIndex: 2,
          lineStyle: { width: 2, color: "#67e8f9" },
          data: this.dataList.temp,
          show: this.checkList.includes("温度")
        },
        // PM2.5 - 绑定右侧第1个Y轴（yAxisIndex: 3）
        {
          name: "PM2.5",
          type: "line",
          smooth: false,
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
          smooth: false,
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
          smooth: false,
          symbol: "none",
          yAxisIndex: 5,
          lineStyle: { width: 2, color: "#ef4444" },
          data: this.dataList.static,
          show: this.checkList.includes("静电干扰"),
          markPoint: {
            symbol: "triangle",
            show: this.tipFlag,
            symbolSize: 15,
            data: [{ name: "预警", coord: ["10:06:00", 416] }],
            itemStyle: { color: "#f97316" },
            label: {
              show: true,
              position: "top",
              formatter: "预警",
              color: "#f97316",
              fontSize: 13,
              offset: [0, -50]
            }
          },
          markLine: {
            symbol: "none",
            show: this.tipFlag,
            lineStyle: { color: "#ffffff", type: "dashed" },
            data: [{ xAxis: "10:06:00" }],
            label: {
              show: false
            }
          }
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
    tipFlag(val) {
      this.updateChartByCheckList();
    },
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
  position: relative;
  width: 100%;
  .px2vh_vw(height, 400);
  background-color: #0e1112;

  .chart {
    width: 100%;
    .px2vh_vw(height, 400);
    background-color: #0e1112;
  }

  .title {
    position: absolute;
    z-index: 99;
    .px2vw(left, 20);
    .px2vh_vw(bottom, 10);
    color: #9e9fa1;
    .px2font(14);
  }
}
</style>
