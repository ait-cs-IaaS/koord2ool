<template>
  <line-chart v-if="renderChart" :data="chartjsData" :style="chartStyle" :options="chartOptions" />
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
import { defineComponent, ref, computed, onMounted } from "vue";
import "chartjs-adapter-moment";
import { nextTick } from "vue";
import { renderAreaChart } from "../../helpers/questionMapping";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, TimeSeriesScale, Filler, Title, Tooltip, Legend);

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
    questionType: {
      type: String,
      default: "",
    },
    questionKey: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const chartOptions = computed(() => {
      if (renderAreaChart(props.questionType)) {
        return areaChartOptions;
      }
      return lineChartOptions;
    });
    const renderChart = ref(false);

    const chartStyle = {
      position: "relative",
      width: "100%",
      height: "300px",
    };

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
    });

    return { chartStyle, renderChart, chartOptions };
  },
});
</script>
