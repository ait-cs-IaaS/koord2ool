<template>
  <candle-chart v-if="renderChart" :data="chartjsData" :style="chartStyle" :options="chartOptions" />
</template>

<script lang="ts">
import { Chart as ChartJS, ChartOptions, ChartData, FinancialDataPoint, TooltipItem } from "chart.js";
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from "chartjs-chart-financial";
import { createTypedChart } from "vue-chartjs";
import { defineComponent, ref, onMounted, nextTick, computed, watch } from "vue";
import "chartjs-adapter-moment";
import { useSurveyStore } from "../../store/surveyStore";
import "../../helpers/custom-ohlc-element";
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

    watch(
      () => props.chartjsData,
      (newData) => {
        console.debug("Candlestick data updated:", newData);
        if (newData?.datasets?.length) {
          const dataset = newData.datasets[0];
        }
      },
      { deep: true, immediate: true },
    );

    const minmax = computed(() => {
      const result = store.minMaxFromDataset?.[props.questionKey];
      console.debug("Min/max values for", props.questionKey, ":", result);
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
                const point = ctx.parsed as FinancialDataPoint;
                return [`Low: ${point.l}`, `High: ${point.h}`, `Open: ${point.o}`, `Close: ${point.c}`];
              },
            },
          },
        },
        elements: {
          candlestick: {
            color: {
              up: "rgba(75, 192, 192, 1)",
              down: "rgba(255, 99, 132, 1)",
              unchanged: "rgba(50, 50, 50, 1)",
            },
            borderWidth: 1.5,
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

    return { chartStyle, renderChart, chartOptions };
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
