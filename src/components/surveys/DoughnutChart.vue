<template>
  <Doughnut :data="chartData" :style="chartStyle" :options="options" />
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
    }
  },
  components: {
    Doughnut,
  },
  data() {
    return {
      options: chartOptions,
      chartStyle: {
        height: "300px",
      },
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
