<template>
  <candle-chart
    v-if="renderChart"
    :data="chartjsData"
    :style="chartStyle"
    :options="chartOptions"
  />
</template>

<script lang="ts">
import {
  Chart as ChartJS,
  ChartOptions,
  ChartData,
  FinancialDataPoint,
} from "chart.js";
import {
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
} from "chartjs-chart-financial";
import { createTypedChart } from "vue-chartjs";
import { defineComponent, ref, onMounted, nextTick } from "vue";
import "chartjs-adapter-moment";
import { koordStore } from "../../store";

const CandleChart = createTypedChart("candlestick", CandlestickElement);

ChartJS.register(
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
);

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
    const store = koordStore();

    const chartStyle = {
      width: "100%",
    };

    const minmax = store.minMaxFromDataset[props.questionKey];

    const chartOptions: ChartOptions<"candlestick"> = {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
          },
        },
        y: {
          min: minmax?.min || 0,
          max: minmax?.max || 100,
        },
      },
      plugins: {
        tooltip: {
          intersect: false,
          mode: "index",
          callbacks: {
            label(ctx) {
              const point = ctx.parsed as FinancialDataPoint;
              if (point.o === point.c) {
                return `${point.o}`;
              }
              return `low: ${point.o} high: ${point.c}`;
            },
          },
        },
      },
    };

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
    });

    return { chartStyle, renderChart, chartOptions };
  },
});
</script>
