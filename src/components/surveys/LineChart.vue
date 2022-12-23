<template>
  <div class="mb-4 my-2 line-container">
    <canvas :id="chartId" ref="chartCanvas" class="line-chart" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { v4 } from "uuid";
import { Chart, ChartData } from "chart.js";
import colors from "./colors";
import lineOptions from "./line-options";

@Component({})
export default class LineChartComponent extends Vue {
  /**
   * The unique DOM ID for this chart.
   * This is usually a combination of "line-" followed by a random UUID (v4).
   */
  @Prop({ type: String, default: () => `line-${v4()}` })
  chartId!: string;

  @Prop({ type: Object, required: true })
  data!: ChartData<"line">;

  @Prop({ type: Boolean, default: () => false })
  isLogicalTime!: boolean;

  private chartJsInstance?: Chart<"line">;

  /**
   * A link to the <canvas> DOM element.
   */
  get domElement(): HTMLCanvasElement {
    return this.$refs.chartCanvas as HTMLCanvasElement;
  }

  get forChartJs(): ChartData<"line"> {
    const replica = { ...this.data };
    const useColors = [...colors];
    replica.datasets.forEach((dataset, index) => {
      dataset.backgroundColor = `${useColors[index % useColors.length]}20`;
      dataset.borderColor = useColors[index % useColors.length];
      dataset.fill = false;
    });
    return replica;
  }

  mounted(): void {
    this.$nextTick(() => this.create());
  }

  @Watch("isLogicalTime", { immediate: false })
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
          ...lineOptions,
          scales: {
            ...(this.isLogicalTime
              ? {
                  x: {
                    type: "linear",
                    title: {
                      display: true,
                      text: "Logical Time",
                    },
                    grid: {
                      borderColor: "#848484",
                      display: true,
                    },
                  },
                }
              : {
                  x: {
                    type: "time",
                    time: {
                      isoWeekday: true,
                      minUnit: "hour",
                      round: "hour",
                      displayFormats: {
                        day: "HH:MM - MMM DD",
                      },
                      tooltipFormat: "MMM DD, YYYY",
                    },
                    grid: {
                      borderColor: "#848484",
                      display: true,
                    },
                    title: {
                      display: false,
                    },
                  },
                }),
            y: {
              beginAtZero: true,
              stacked: "single",
              ticks: {
                precision: 0,
              },
              grid: {
                borderColor: "#848484",
                display: false,
              },
            },
          },
        },
      });
    } else {
      this.chartJsInstance.data = this.data;

      this.chartJsInstance.data.datasets.forEach((dataset, index) => {
        dataset.backgroundColor = colors[index % colors.length] + "20";
        dataset.borderColor = colors[index % colors.length];
        dataset.fill = false;
      });

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
