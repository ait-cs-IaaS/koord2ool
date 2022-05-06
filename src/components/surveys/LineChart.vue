<template>
  <canvas :id="chartId" ref="chartCanvas" class="line-chart" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { v4 } from "uuid";
import { Chart, ChartData, ChartOptions } from "chart.js";
import colors from "./colors";

export const LineChartOptions: ChartOptions<"line"> = {
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      align: "center",
    },
  },
  scales: {
    x: {
      type: "time",
      time: {
        tooltipFormat: "YYYY-MM-DD",
      },
      title: {
        display: true,
        text: "Date",
      },
    },
    y: {
      stacked: true,
    },
  },
};

@Component({})
export default class LineChartComponent extends Vue {
  @Prop({ type: String, default: () => `line-${v4()}` })
  chartId!: string;

  @Prop({ type: Object, required: true })
  data!: ChartData<"line">;

  private chartJsInstance?: Chart<"line">;

  get domElement(): HTMLCanvasElement {
    return this.$refs.chartCanvas as HTMLCanvasElement;
  }

  mounted(): void {
    this.$nextTick(() => this.create());
  }

  @Watch("data")
  private create(): Chart<"line"> {
    if (typeof this.chartJsInstance === "undefined") {
      const config = {
        type: "line",
        data: this.data,
        options: { ...LineChartOptions },
      };
      console.debug(config);
      this.chartJsInstance = new Chart<"line">(this.domElement, {
        type: "line",
        data: this.data,
        options: { ...LineChartOptions },
      });
    } else {
      this.chartJsInstance.data = this.data;
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
