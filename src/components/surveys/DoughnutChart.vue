<template>
  <div
    class="px-2 my-2 doughnut-container"
    :class="{ 'small-container': true }"
  >
    <canvas :id="chartId" ref="chartCanvas" class="doughnut-chart" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { v4 } from "uuid";
import { Chart, ChartDataset, ChartOptions } from "chart.js";
import colors from "./colors";

export const DoughnutChartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: "80%",
  radius: "100%",
  rotation: 0,
  circumference: 360,
  offset: 0,
  animation: {
    animateRotate: true,
    animateScale: false,
  },
  plugins: {
    legend: {
      display: false,
      position: "top",
      align: "center",
      maxWidth: 200,
    },
    tooltip: {
      backgroundColor: "#FFFFFF",
      titleColor: "#575757",
      bodyColor: "#575757",
      padding: 12,
      caretSize: 0,
      cornerRadius: 1,
      boxPadding: 5,
      borderColor: "#A4A4A4",
      borderWidth: 1,
      position: "average",
      callbacks: {
        label: function (context) {
          // return "" + context.label + " " + context.formattedValue;
          return context.formattedValue;
        },
      },
    },
  },
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
};

@Component({})
export default class doughnutChartComponent extends Vue {
  @Prop({ type: String, default: () => `doughnut-${v4()}` })
  chartId!: string;

  @Prop({ type: Array, default: () => [] })
  counters!: { name: string; value: number }[];

  private chartJsInstance?: Chart<"doughnut">;

  get domElement(): HTMLCanvasElement {
    return this.$refs.chartCanvas as HTMLCanvasElement;
  }

  get forChartJs(): { labels: string[]; datasets: ChartDataset<"doughnut">[] } {
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
  }

  mounted(): void {
    this.$nextTick(() => this.create());
  }

  @Watch("counters")
  private create(): Chart<"doughnut"> {
    if (typeof this.chartJsInstance === "undefined") {
      this.chartJsInstance = new Chart<"doughnut">(this.domElement, {
        type: "doughnut",
        data: this.forChartJs,
        options: { ...DoughnutChartOptions },
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
