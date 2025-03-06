<template>
  <candle-chart v-if="renderChart" :data="chartjsData" :style="chartStyle" :options="chartOptions" />
</template>

<script lang="ts">
import { Chart as ChartJS, ChartOptions, ChartData, FinancialDataPoint } from "chart.js";
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from "chartjs-chart-financial";
import { createTypedChart } from "vue-chartjs";
import { defineComponent, ref, onMounted, nextTick, computed, watch } from "vue";
import "chartjs-adapter-moment";
import { useSurveyStore } from "../../store/surveyStore";

const CandleChart = createTypedChart("candlestick", CandlestickElement);
ChartJS.register(CandlestickController, CandlestickElement, OhlcController, OhlcElement);

export default defineComponent({
  name: "CandleStickChartComponent",
  components: {
    CandleChart,
  },
  props: {
    chartjsData: {
      type: Object as () => ChartData<"candlestick">,
      required: true,
    },
    questionKey: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const renderChart = ref(false);
    const store = useSurveyStore();
    const chartStyle = {
      width: "100%",
      height: "100%",
    };

    watch(
      () => props.chartjsData,
      (newData) => {
        console.debug("Chart data updated:", newData);
      },
      { deep: true },
    );

    const minmax = computed(() => store.minMaxFromDataset[props.questionKey]);

    const chartOptions = computed(
      (): ChartOptions<"candlestick"> => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
              displayFormats: {
                day: "MMM D",
              },
            },
            title: {
              display: true,
              text: "Date",
              font: {
                size: 10,
                weight: "bold",
              },
              padding: {
                top: 0
              }
            },
            adapters: {
              date: {
                locale: "en",
              },
            },
            ticks: {
              font: {
                size: 9
              },
              maxRotation: 0,
              maxTicksLimit: 8
            },
            grid: {
              display: false
            }
          },
          y: {
            min: minmax.value?.min || 0,
            max: minmax.value?.max || 200,
            title: {
              display: true,
              text: "Value",
              font: {
                size: 10,
                weight: "bold",
              },
              padding: {
                bottom: 0
              }
            },
            ticks: {
              font: {
                size: 9
              },
              maxTicksLimit: 5
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)"
            }
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: {
              size: 11
            },
            bodyFont: {
              size: 11
            },
            intersect: false,
            mode: "index",
            callbacks: {
              label(ctx) {
                const point = ctx.parsed as FinancialDataPoint;
                return [
                  `Low: ${point.l}`, 
                  `High: ${point.h}`,
                  `Open: ${point.o}`,
                  `Close: ${point.c}`
                ];
              },
            },
          },
        },
        elements: {
          candlestick: {
            color: {
              up: 'rgba(75, 192, 192, 1)',
              down: 'rgba(255, 99, 132, 1)',
              unchanged: 'rgba(90, 90, 90, 1)',
            }
          }
        },
        layout: {
          padding: {
            left: 2,
            right: 10,
            top: 8,
            bottom: 2
          }
        }
      }),
    );

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
      console.debug("Chart mounted with data:", props.chartjsData);
    });

    return { chartStyle, renderChart, chartOptions };
  },
});
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>