<template>
  <line-chart
    v-if="renderChart"
    :data="chartjsData"
    :style="chartStyle"
    :options="chartOptions"
  />
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
import { lineChartOptions } from "./line-options";
import { defineComponent, ref } from "vue";
import "chartjs-adapter-moment";
import { onMounted } from "vue";
import { nextTick } from "vue";

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
  Legend
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
    },
    showLegend: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const chartOptions = JSON.parse(JSON.stringify(lineChartOptions));
    const renderChart = ref(false);

    if (props.showLegend) {
      chartOptions.plugins.legend.display = true;
    } else {
      chartOptions.plugins.legend.display = false;
    }
    const chartStyle = {
      width: "100%",
    };

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
    });

    return { chartOptions, chartStyle, renderChart };
  },
});
</script>
