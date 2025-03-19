<template>
  <candle-chart v-if="renderChart" :data="processedChartData" :style="chartStyle" :options="chartOptions" :plugins="medianPlugins" />
</template>

<script lang="ts">
import { Chart as ChartJS, ChartOptions, ChartData, FinancialDataPoint, TooltipItem, Plugin } from "chart.js";
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from "chartjs-chart-financial";
import { createTypedChart } from "vue-chartjs";
import { defineComponent, ref, onMounted, nextTick, computed, watch } from "vue";
import "chartjs-adapter-moment";
import { useSurveyStore } from "../../store/surveyStore";
const CandleChart = createTypedChart("candlestick", CandlestickElement);

ChartJS.register(CandlestickController, CandlestickElement, OhlcController, OhlcElement);

type CandlestickChartOptions = ChartOptions<"candlestick"> & {
  elements?: {
    candlestick?: {
      color?: {
        up?: string;
        down?: string;
        unchanged?: string;
      };
      borderWidth?: number;
    };
  };
};

const medianLinesPlugin: Plugin = {
  id: "medianLines",
  afterDatasetsDraw: (chart) => {
    const { ctx, chartArea, scales } = chart;
    if (!scales.x || !scales.y || !chart.data.datasets[0]) return;

    const dataset = chart.data.datasets[0];

    ctx.save();
    ctx.lineWidth = 1.5; 
    ctx.strokeStyle = "rgba(0, 0, 0, 1)"; 
    ctx.setLineDash([]); 

    dataset.data.forEach((data: any) => {
      if (!data || typeof data !== "object" || !("m" in data) || !("x" in data)) return;

      const x = scales.x.getPixelForValue(data.x);
      const y = scales.y.getPixelForValue(data.m);

      if (x >= chartArea.left && x <= chartArea.right && y >= chartArea.top && y <= chartArea.bottom) {
        const candleWidth = 8; 

        ctx.beginPath();
        ctx.moveTo(x - candleWidth / 2, y);
        ctx.lineTo(x + candleWidth / 2, y);
        ctx.stroke();
      }
    });

    ctx.restore();
  },
};

export default defineComponent({
  name: "CandleStickChartComponent",
  components: {
    CandleChart,
  },
  props: {
    chartjsData: {
      type: Object as () => ChartData<"candlestick">,
      required: true,
    },
    questionKey: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const renderChart = ref(false);
    const store = useSurveyStore();
    const chartStyle = {
      width: "100%",
      height: "100%",
    };

    const processedChartData = computed(() => {
      if (!props.chartjsData || !props.chartjsData.datasets || props.chartjsData.datasets.length === 0) {
        return props.chartjsData;
      }

      const newData = JSON.parse(JSON.stringify(props.chartjsData));

      newData.datasets[0].data = newData.datasets[0].data.map((point: any) => {
        if (point && typeof point === "object") {
          const median = point.m;

          return {
            x: point.x,
            o: point.o,
            h: point.c, 
            l: point.o, 
            c: point.c,
            m: median, 
          };
        }
        return point;
      });

      return newData;
    });

    const medianPlugins = [medianLinesPlugin];

    watch(
      () => props.chartjsData,
      (newData) => {
        console.debug("Candlestick data updated:", newData);
        if (newData?.datasets?.length) {
          const dataset = newData.datasets[0];
          if (dataset.data?.length > 0) {
            console.debug("Sample data point:", dataset.data[0]);
          }
        }
      },
      { deep: true, immediate: true },
    );

    const minmax = computed(() => {
      const result = store.minMaxFromDataset?.[props.questionKey];
      return result;
    });

    const formatYAxisTick = (value: string | number, index: number, ticks: Array<{ value: number }>) => {
      if (index === ticks.length - 1) {
        return null;
      }
      return value;
    };

    const chartOptions = computed((): CandlestickChartOptions => {
      return {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          candlestick: {
            color: {
              up: "rgba(75, 192, 192, 1)",
              down: "rgba(255, 99, 132, 1)",
              unchanged: "rgba(50, 50, 50, 1)",
            },
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
              displayFormats: {
                day: "MMM D",
              },
            },
            title: {
              display: true,
              text: "Date",
              font: { size: 10, weight: "bold" },
              padding: { top: 0 },
            },
            adapters: {
              date: {
                locale: "en",
              },
            },
            ticks: {
              font: { size: 9 },
              maxRotation: 0,
              maxTicksLimit: 8,
            },
            grid: { display: false },
          },
          y: {
            min: minmax.value?.min || 0,
            max: minmax.value?.max || 200,
            title: {
              display: true,
              text: "Value",
              font: { size: 10, weight: "bold" },
              padding: { bottom: 0 },
            },
            ticks: {
              font: { size: 9 },
              maxTicksLimit: 5,
              callback: formatYAxisTick,
              padding: 8,
            },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: { size: 11 },
            bodyFont: { size: 11 },
            intersect: false,
            mode: "index" as const,
            callbacks: {
              label(ctx: TooltipItem<"candlestick">) {
                const point = ctx.parsed as any;
                const dataPoint = ctx.dataset.data[ctx.dataIndex] as any;
                const hasMedian = dataPoint && typeof dataPoint === "object" && "m" in dataPoint;

                const tooltipLabels = [];

                if (hasMedian) {
                  tooltipLabels.push(`Median: ${dataPoint.m}`);
                }

                tooltipLabels.push(`Open: ${point.o}`, `High: ${point.h}`, `Low: ${point.l}`, `Close: ${point.c}`);

                return tooltipLabels;
              },
            },
          },
        },
        layout: {
          padding: {
            left: 2,
            right: 10,
            top: 20,
            bottom: 10,
          },
        },
      };
    });

    onMounted(async () => {
      try {
        await nextTick();
        renderChart.value = true;
      } catch (error) {
        console.error("Error rendering candlestick chart:", error);
      }
    });

    return { chartStyle, renderChart, chartOptions, medianPlugins, processedChartData };
  },
});
</script>
<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
