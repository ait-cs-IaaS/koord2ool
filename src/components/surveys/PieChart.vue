<template>
  <Pie :data="chartData" :options="options" />
</template>

<script lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartDataset } from "chart.js";
import { Pie } from "vue-chartjs";
import { pieChartOptions } from "./chart-options";
import { computed, defineComponent } from "vue";
import { getBorderColor } from "../../helpers/shared-chartFunctions";

ChartJS.register(ArcElement, Tooltip, Legend);

export default defineComponent({
  name: "PieChartComponent",
  components: {
    Pie,
  },
  props: {
    counters: {
      type: Array as () => { name: string; value: number }[],
      default: () => [],
    },
  },
  setup(props) {
    const chartData = computed(() => {
      const labels: string[] = [];
      const datasets: ChartDataset<"pie">[] = [];
      props.counters.forEach(({ name, value }) => {
        labels.push(name);
        datasets.push({
          data: [value],
          backgroundColor: [getBorderColor(name)],
        });
      });
      return {
        labels,
        datasets,
      };
    });
    return {
      options: pieChartOptions,
      chartData,
    };
  },
});
</script>
