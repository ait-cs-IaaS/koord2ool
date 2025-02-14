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
      height: "350px",  // Add explicit height
    };

    // Watch for changes in chartjsData
    watch(() => props.chartjsData, (newData) => {
      console.debug('Chart data updated:', newData);
    }, { deep: true });

    const minmax = computed(() => store.minMaxFromDataset[props.questionKey]);

    const chartOptions = computed((): ChartOptions<"candlestick"> => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            displayFormats: {
              day: 'MMM D'
            }
          },
          title: {
            display: true,
            text: "Date",
          },
          adapters: {
            date: {
              locale: 'en'
            }
          }
        },
        y: {
          min: minmax.value?.min || 0,
          max: minmax.value?.max || 200,
          title: {
            display: true,
            text: "Value",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          intersect: false,
          mode: "index",
          callbacks: {
            label(ctx) {
              const point = ctx.parsed as FinancialDataPoint;
              return [
                `Low: ${point.l}`,
                `High: ${point.h}`,
              ];
            },
          },
        },
      },
    }));

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
      console.debug('Chart mounted with data:', props.chartjsData);
    });

    return { chartStyle, renderChart, chartOptions };
  },
});
</script>