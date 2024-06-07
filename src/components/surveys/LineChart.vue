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
import { lineChartOptions, areaChartOptions } from "./line-options";
import { defineComponent, ref, computed } from "vue";
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
    },
    questionType: { type: String, default: "" },
  },
  setup(props) {
    const chartOptions = computed(() => {
      if (
        props.questionType === "yesno" ||
        props.questionType === "list_dropdown"
      ) {
        return areaChartOptions;
      }
      return lineChartOptions;
    });
    const renderChart = ref(false);

    const chartStyle = {
      width: "100%",
    };

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
    });

    return { chartStyle, renderChart, chartOptions };
  },
});
</script>
