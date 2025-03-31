<template>
  <line-chart v-if="renderChart" :data="chartjsData" :style="chartStyle" :options="enhancedOptions" />
</template>

<script lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TimeScale,
  TimeSeriesScale,
  Filler,
  TooltipItem,
} from "chart.js";
import { Line as LineChart } from "vue-chartjs";
import { lineChartOptions, areaChartOptions } from "./chart-options";
import { defineComponent, ref, computed, onMounted } from "vue";
import "chartjs-adapter-moment";
import { nextTick } from "vue";
import { getChartType } from "../../helpers/questionMapping";
import { useSurveyStore } from "../../store/surveyStore";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, TimeSeriesScale, Filler, Title, Tooltip, Legend);

export default defineComponent({
  name: "LineChartComponent",
  components: {
    LineChart,
  },
  props: {
    chartjsData: {
      type: Object as () => ChartData<"line">,
      required: true,
    },
    questionType: {
      type: String,
      default: "",
    },
    questionKey: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useSurveyStore();
    const renderChart = ref(false);

    const enhancedOptions = computed(() => {
      if (getChartType(props.questionType) === "line") {
        console.debug(`Rendering line chart for question ${props.questionKey}`);
        return lineChartOptions;
      }

      const options = JSON.parse(JSON.stringify(areaChartOptions));

      if (store.settings.timeFormat === "stepped") {
        if (options.plugins && options.plugins.tooltip && options.plugins.tooltip.callbacks) {
          const originalCallbacks = options.plugins.tooltip.callbacks || {};
          options.plugins.tooltip.callbacks = {
            ...originalCallbacks,
            label: (context: TooltipItem<"line">) => {
              const dataPoint = context.raw as { tooltip?: string };
              if (dataPoint && dataPoint.tooltip) {
                return dataPoint.tooltip.split("\n");
              }
              if (originalCallbacks.label) {
                return originalCallbacks.label(context);
              }
              return `${context.dataset.label || ""}: ${context.formattedValue}`;
            },
          };
        }
      }

      return options;
    });

    const chartStyle = {
      position: "relative",
      width: "100%",
      height: "300px",
    };

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
    });

    return { chartStyle, renderChart, enhancedOptions };
  },
});
</script>
