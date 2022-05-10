<template>
  <canvas :id="chartId" ref="chartCanvas" class="line-chart" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { v4 } from "uuid";
import { Chart, ChartData } from "chart.js";
import colors from "./colors";

@Component({})
export default class LineChartComponent extends Vue {
  @Prop({ type: String, default: () => `line-${v4()}` })
  chartId!: string;

  @Prop({ type: Object, required: true })
  data!: ChartData<"line">;

  @Prop({ type: Boolean, default: () => false })
  isLogicalTime!: boolean;

  private chartJsInstance?: Chart<"line">;

  get domElement(): HTMLCanvasElement {
    return this.$refs.chartCanvas as HTMLCanvasElement;
  }

  get forChartJs(): ChartData<"line"> {
    const replica = { ...this.data };
    const useColors = [...colors];
    replica.datasets.forEach((dataset, index) => {
      dataset.backgroundColor = useColors[index % useColors.length];
    });
    return replica;
  }

  mounted(): void {
    this.$nextTick(() => this.create());
  }

  @Watch("logicalTime")
  private recreate(): void {
    this.destroy();
    this.create();
  }

  @Watch("data")
  private create(): Chart<"line"> {
    if (typeof this.chartJsInstance === "undefined") {
      this.chartJsInstance = new Chart<"line">(this.domElement, {
        type: "line",
        data: this.forChartJs,
        options: {
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              align: "center",
            },
          },
          scales: {
            ...(this.isLogicalTime
              ? {
                  x: {
                    type: "linear",
                    title: {
                      display: true,
                      text: "Logical Time",
                    },
                  },
                }
              : {
                  x: {
                    type: "time",
                    time: {
                      isoWeekday: true,
                      minUnit: "day",
                      tooltipFormat: "MMM DD",
                    },
                    title: {
                      display: true,
                      text: "Date",
                    },
                  },
                }),
            y: {
              beginAtZero: true,
              stacked: "single",
              ticks: {
                precision: 0,
              },
            },
          },
        },
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
