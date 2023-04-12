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
import { chartColors } from "./colors";
import { chartOptions } from "./doughnut-options";
import { defineComponent } from "vue";

ChartJS.register(ArcElement, Tooltip, Legend);

export default defineComponent({
  name: "DoughnutChartComponent",
  props: {
    counters: {
      type: Array as () => { name: string; value: number }[],
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
          backgroundColor.push(chartColors[index % chartColors.length]);
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
