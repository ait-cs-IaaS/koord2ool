<template>
  <Doughnut :data="chartData" :options="options" />
</template>

<script lang="ts">
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataset,
} from "chart.js";
import { Doughnut } from "vue-chartjs";
import { v4 } from "uuid";
import colors from "./colors";
import { chartOptions } from "./doughnut-options";
import { defineComponent } from "vue";

ChartJS.register(ArcElement, Tooltip, Legend);

export default defineComponent({
  name: "DoughnutChartComponent",
  props: {
    counters: {
      type: Array,
      default: () => [],
    },
    chartId: {
      type: String,
      default: () => `doughnut-${v4()}`,
    },
  },
  components: {
    Doughnut,
  },
  data() {
    return {
      options: chartOptions,
    };
  },
  computed: {
    chartData(): { labels: string[]; datasets: ChartDataset<"doughnut">[] } {
      const labels: string[] = [];
      const datasets: ChartDataset<"doughnut">[] = [];
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
