<template>
  <candle-chart v-if="renderChart" :data="chartjsData" :style="chartStyle" :options="chartOptions" />
</template>

<script lang="ts">
import { Chart as ChartJS, ChartOptions, ChartData, FinancialDataPoint } from "chart.js";
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from "chartjs-chart-financial";
import { createTypedChart } from "vue-chartjs";
import { defineComponent, ref, onMounted, nextTick, computed } from "vue";
import "chartjs-adapter-moment";
import { useSurveyStore } from "../../store/surveyStore";
import { getQuestionText } from "../../helpers/chartFunctions";

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
    };

    const minmax = store.minMaxFromDataset[props.questionKey];

    const chartOptions = computed((): ChartOptions<"candlestick"> => ({
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
          },
          title: {
            display: true,
            text: "Date",
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        y: {
          min: minmax?.min || 0,
          max: minmax?.max || 100,
          title: {
            display: true,
            text: "Value",
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
      },
      plugins: {
        title: {
          display: false,
          text: getQuestionText(props.questionKey),
          padding: 20,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          intersect: false,
          mode: "index",
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label(ctx) {
              const point = ctx.parsed as FinancialDataPoint;
              if (point.o === point.c) {
                return `${point.o}`;
              }
              return `low: ${point.o} high: ${point.c}`;
            },
          },
        },
      },
    }));

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
    });

    return { chartStyle, renderChart, chartOptions };
  },
});
</script>
