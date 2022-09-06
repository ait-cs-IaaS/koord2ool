<template>
  <canvas :id="chartId" ref="chartCanvas" class="pie-chart" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { v4 } from "uuid";
import { Chart, ChartDataset } from "chart.js";
import colors from "./colors";
import pieOptions from "./pie-options";

@Component({})
export default class PieChartComponent extends Vue {
  /**
   * The unique DOM ID for this chart.
   * This is usually a combination of "pie-" followed by a random UUID (v4).
   */
  @Prop({ type: String, default: () => `pie-${v4()}` })
  chartId!: string;

  @Prop({ type: Array, default: () => [] })
  counters!: { name: string; value: number }[];

  private chartJsInstance?: Chart<"pie">;

  /**
   * A link to the <canvas> DOM element.
   */
  get domElement(): HTMLCanvasElement {
    return this.$refs.chartCanvas as HTMLCanvasElement;
  }

  get forChartJs(): { labels: string[]; datasets: ChartDataset<"pie">[] } {
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
  }

  mounted(): void {
    this.$nextTick(() => this.create());
  }

  @Watch("counters")
  private create(): Chart<"pie"> {
    if (typeof this.chartJsInstance === "undefined") {
      this.chartJsInstance = new Chart<"pie">(this.domElement, {
        type: "pie",
        data: this.forChartJs,
        options: { ...pieOptions },
      });
    } else {
      this.chartJsInstance.data = this.forChartJs;
      this.chartJsInstance.update("none");
    }
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
