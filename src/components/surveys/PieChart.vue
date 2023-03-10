<template>
  <Pie :data="chartData" :options="options" />
</template>

<script lang="ts">
import { v4 } from "uuid";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataset,
} from "chart.js";
import { Pie } from "vue-chartjs";
import colors from "./colors";
import { chartOptions } from "./pie-options";
import { defineComponent } from "vue";

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
    chartId: {
      type: String,
      default: () => `pie-${v4()}`,
    },
  },
  data() {
    return {
      options: chartOptions,
    };
  },
  computed: {
    chartData(): { labels: string[]; datasets: ChartDataset<"pie">[] } {
      const labels: string[] = [];
      const datasets: ChartDataset<"pie">[] = [];
      if (Array.isArray(this.counters)) {
        const data: number[] = [];
        const backgroundColor: string[] = [];
        this.counters.forEach(({ name, value }, index) => {
          labels.push(name);
          data.push(value);
          backgroundColor.push(colors[index % colors.length]);
        });
        datasets.push({
          data,
          backgroundColor,
        });
      }
      return {
        labels,
        datasets,
      };
    },
  },
});
</script>
