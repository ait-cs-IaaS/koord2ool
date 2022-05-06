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
        tooltipFormat: "MMM DD",
      },
      title: {
        display: true,
        text: "Date",
      },
    },
    y: {
      beginAtZero: true,
      stacked: "single",
      ticks: {
        precision: 0,
      },
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

  get forChartJs(): ChartData<"line"> {
    const replica = { ...this.data };
    replica.datasets.forEach((dataset, index) => {
      dataset.backgroundColor = colors[index % colors.length];
    });
    return replica;
  }

  mounted(): void {
    this.$nextTick(() => this.create());
  }

  @Watch("data")
  private create(): Chart<"line"> {
    if (typeof this.chartJsInstance === "undefined") {
      this.chartJsInstance = new Chart<"line">(this.domElement, {
        type: "line",
        data: this.forChartJs,
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
