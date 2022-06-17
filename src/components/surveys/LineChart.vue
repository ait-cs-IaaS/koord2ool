<template>
  <div class="mb-4 my-2 line-container">
    <canvas :id="chartId" ref="chartCanvas" class="line-chart" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { v4 } from "uuid";
import { Chart, ChartData, ChartOptions } from "chart.js";
import colors from "./colors";

export const LineChartOptions: ChartOptions<"line"> = {
  showLine: true,
  elements: {
    point: {
      hitRadius: 40,
      pointStyle: "circle",
      hoverRadius: 10,
      radius: 0,
      borderWidth: 2,
      hoverBorderWidth: 2,
    },
    line: {
      fill: true,
      borderWidth: 5,
      tension: 0.0,
      borderCapStyle: "round",
      // stepped: true,
    },
  },
  plugins: {
    filler: {
      propagate: true,
    },
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
          return context.formattedValue;
        },
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
          ...LineChartOptions,
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
                      minUnit: "day",
                      round: "day",
                      displayFormats: {
                        day: "MMM DD",
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
