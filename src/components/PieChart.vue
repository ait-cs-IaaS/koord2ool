<template>
  <canvas :id="chartId" ref="chartCanvas" class="pie-chart" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { v4 } from "uuid";
import { Chart, ChartDataset, ChartOptions } from "chart.js";

const colors = [
  "rgb(255, 99, 132)",
  "rgb(54, 162, 235)",
  "rgb(255, 205, 86)",
  "rgb(43, 194, 98)",
];

export const DefaultChartOptions: ChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
    },
  },
};

@Component({})
export default class PieChartComponent extends Vue {
  @Prop({ type: String, default: () => `chart-${v4()}` })
  chartId!: string;

  @Prop({ type: Array, default: () => [] })
  counters!: { name: string; value: number }[];

  @Prop({ type: Object, default: () => DefaultChartOptions })
  chartOptions!: ChartOptions;

  private chartJsInstance?: Chart;

  get domElement(): HTMLCanvasElement {
    return this.$refs.chartCanvas as HTMLCanvasElement;
  }

  get forChartJs(): { labels: string[]; datasets: ChartDataset[] } {
    const labels: string[] = [];
    const datasets: ChartDataset[] = [];
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

  mounted(): void {
    this.$nextTick(() => this.create());
  }

  @Watch("counters")
  private create(): Chart {
    this.destroy();
    this.chartJsInstance = new Chart(this.domElement, {
      type: "pie",
      data: this.forChartJs,
      options: this.chartOptions,
    });
    return this.chartJsInstance;
  }

  private destroy(): void {
    if (typeof this.chartJsInstance !== "undefined") {
      this.chartJsInstance.destroy();
      this.chartJsInstance = undefined;
    }
  }
}
</script>
