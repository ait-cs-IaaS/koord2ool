<template>
  <Pie
    :chart-id="chartId"
    :chart-data="forChartJs"
    :chart-options="chartOptions"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { v4 } from "uuid";
import { Pie } from "vue-chartjs";
import { Chart, ArcElement, Tooltip } from "chart.js";

Chart.register(ArcElement, Tooltip);

const colors = [
  "rgb(255, 99, 132)",
  "rgb(54, 162, 235)",
  "rgb(255, 205, 86)",
  "rgb(43, 194, 98)",
];

export default defineComponent({
  name: "PieChartComponent",
  components: {
    Pie,
  },
  props: {
    chartId: {
      type: String,
      default: () => `chart-${v4()}`,
    },

    counters: {
      type: Array,
      default: () => [],
    },

    chartOptions: {
      type: Object,
      default: () => ({ responsive: true }),
    },
  },
  computed: {
    forChartJs() {
      const labels: string[] = [];
      const datasets: any[] = [];
      if (Array.isArray(this.counters)) {
        const dataset = {
          data: [] as number[],
          backgroundColor: [] as string[],
        };
        this.counters.forEach(({ name, value }, index) => {
          labels.push(name);
          dataset.data.push(value);
          dataset.backgroundColor.push(colors[index % colors.length]);
        });
        datasets.push(dataset);
      }
      return {
        labels,
        datasets,
      };
    },
  },
  methods: {
    createChart() {
      console.debug("TODO");
    },

    destroyChart() {
      console.debug("TODO");
    },
  },
});
</script>
