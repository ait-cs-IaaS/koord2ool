<template>
  <line-chart :data="chartjsData" :style="chartStyle" :options="chartOptions" />
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
Filler,
} from "chart.js";
import { Line as LineChart } from "vue-chartjs";
import { chartOptions } from "./line-options";
import { defineComponent } from "vue";
import 'chartjs-adapter-moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
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
  name: "LineChartComponent",
  components: {
    LineChart,
  },
  props: {
    chartjsData: {
      type: Object as () => ChartData<"line">,
      required: true,
    }
  },
  data() {
    return {
      chartOptions: chartOptions,
      chartStyle: {
        width: "100%",
      },
    };
  },
});
</script>
