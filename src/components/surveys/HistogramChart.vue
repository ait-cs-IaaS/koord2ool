<template>
  <div class="chart-container">
    <div v-if="!hasData" class="no-data-message">
      <p>{{ noDataMessage }}</p>
    </div>
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { Bar } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, TooltipItem, Legend, BarElement, CategoryScale, LinearScale, ChartData } from "chart.js";
import { histogramChartOptions } from "./chart-options";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
import { HistogramChartData } from "../../helpers/chart-types";

export default defineComponent({
  name: "HistogramChart",
  components: { Bar },
  props: {
    chartjsData: {
      type: Object as () => HistogramChartData,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
    questionKey: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const hasData = computed((): boolean => {
      return props.chartjsData?.datasets?.[0]?.data?.length > 0;
    });

    const noDataMessage = computed((): string => {
      return props.chartjsData?.title || "Not enough data to display histogram";
    });

    const chartData = computed((): ChartData<"bar"> => {
      if (!hasData.value) {
        return { labels: [], datasets: [] };
      }

      return {
        labels: props.chartjsData.labels || [],
        datasets: props.chartjsData.datasets,
      };
    });

    const totalResponses = computed((): number => {
      if (!hasData.value) {
        return 0;
      }

      return props.chartjsData.datasets[0].data.reduce((sum: number, value: unknown) => {
        if (Array.isArray(value)) {
          return sum + value.reduce((a, b) => a + b, 0);
        } else if (typeof value === "number") {
          return sum + value;
        } else {
          return sum;
        }
      }, 0);
    });

    const chartOptions = computed(() => {
      const baseOptions = JSON.parse(JSON.stringify(histogramChartOptions));
      baseOptions.plugins.tooltip = {
        callbacks: {
          title(tooltipItems: TooltipItem<"bar">[]) {
            return `${tooltipItems[0].label}`;
          },
          label(context: TooltipItem<"bar">) {
            const count = context.parsed.y || 0;
            const percentage = totalResponses.value > 0 ? ((count / totalResponses.value) * 100).toFixed(1) : "0";

            return [`Count: ${count} out of ${totalResponses.value}`, `Percentage: ${percentage}%`];
          },
        },
      };
      return baseOptions;
    });

    return {
      chartData,
      chartOptions,
      hasData,
      noDataMessage,
    };
  },
});
</script>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data-message {
  text-align: center;
  color: #666;
  font-style: italic;
}
</style>
