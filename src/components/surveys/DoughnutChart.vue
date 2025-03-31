<template>
  <Doughnut :data="chartData" :style="chartStyle" :options="options" />
</template>

<script lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from "chart.js";
import { Doughnut } from "vue-chartjs";
import { doughnutChartOptions } from "./chart-options";
import { doughnutChartData } from "../../helpers/chartFunctions";
import { defineComponent, computed, ref } from "vue";

ChartJS.register(ArcElement, Tooltip, Legend);

export default defineComponent({
  name: "DoughnutChartComponent",
  components: {
    Doughnut,
  },
  props: {
    counters: {
      type: Array as () => { name: string; value: number }[],
      default: () => [],
    },
  },
  setup(props) {
    const options = doughnutChartOptions;
    const chartStyle = ref({
      height: "300px",
    });

    const chartData = computed((): ChartData<"doughnut"> => doughnutChartData(props.counters));

    return {
      options,
      chartStyle,
      chartData,
    };
  },
});
</script>
