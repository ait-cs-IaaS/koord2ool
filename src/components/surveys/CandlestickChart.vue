<template>
  <candle-chart v-if="renderChart" :data="chartjsData" :style="chartStyle" />
</template>

<script lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TimeScale,
  TimeSeriesScale,
  BarController,
  BarElement,
  Filler,
} from "chart.js";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";
import { createTypedChart } from "vue-chartjs";
import { candlestickChartOptions } from "./line-options";
import { defineComponent, ref } from "vue";
import "chartjs-adapter-moment";
import { onMounted } from "vue";
import { nextTick } from "vue";

const CandleChart = createTypedChart("candlestick", CandlestickController);

ChartJS.register(
  CandlestickController,
  CandlestickElement,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  PointElement,
  LineElement,
  TimeScale,
  TimeSeriesScale,
  Filler,
  Title,
  Tooltip,
  Legend,
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
  },
  setup() {
    const renderChart = ref(false);

    const chartStyle = {
      width: "100%",
    };

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
    });

    return { chartStyle, renderChart, chartOptions: candlestickChartOptions };
  },
});
</script>
