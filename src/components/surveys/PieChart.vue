<template>
  <Pie :data="chartData" :options="options" />
</template>

<script lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartDataset } from "chart.js";
import { Pie } from "vue-chartjs";
import { chartColors } from "./colors";
import { chartOptions } from "./pie-options";
import { computed, defineComponent } from "vue";

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
      props.counters.forEach(({ name, value }, index) => {
        labels.push(name);
        datasets.push({
          data: [value],
          backgroundColor: [chartColors[index % chartColors.length]],
        });
      });
      return {
        labels,
        datasets,
      };
    });
    return {
      options: chartOptions,
      chartData,
    };
  },
});
</script>
