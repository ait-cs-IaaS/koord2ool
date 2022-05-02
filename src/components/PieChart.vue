<template>
  <Pie
    :chart-id="chartId"
    :chart-data="forChartJs"
    :chart-options="chartOptions"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
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

@Component({
  components: {
    Pie,
  },
})
export default class PieChartComponent extends Vue {
  @Prop({ type: String, default: () => `chart-${v4()}` })
  chartId!: string;

  @Prop({ type: Array, default: () => [] })
  counters!: { name: string; value: number; }[];

  @Prop({ type: Object, default: () => ({ responsive: true })})
  chartOptions!: unknown;

  get forChartJs(): unknown {
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
  }

  createChart() {
    console.debug("TODO");
  }

  destroyChart() {
    console.debug("TODO");
  }
}
</script>
