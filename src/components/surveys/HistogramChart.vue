<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { Bar } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartOptions, ChartData } from "chart.js";

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
    const chartData = computed((): ChartData<"bar"> => {
      if (!props.chartjsData || !props.chartjsData.datasets) {
        return { labels: [], datasets: [] };
      }

      return {
        labels: props.chartjsData.labels || [],
        datasets: props.chartjsData.datasets,
      };
    });

    const totalResponses = computed((): number => {
      if (!props.chartjsData || !props.chartjsData.datasets || !props.chartjsData.datasets[0]) {
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

    const chartOptions = computed((): ChartOptions<"bar"> => {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!props.chartjsData.title,
            text: props.chartjsData.title || "",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          subtitle: {
            display: !!props.chartjsData.subtitle,
            text: props.chartjsData.subtitle || "",
            font: {
              size: 12,
            },
            padding: {
              bottom: 10,
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title(tooltipItems) {
                return `${tooltipItems[0].label}`;
              },
              label(context) {
                const count = context.parsed.y;
                const percentage = totalResponses.value > 0 ? ((count / totalResponses.value) * 100).toFixed(1) : "0";

                return [`Count: ${count} out of ${totalResponses.value}`, `Percentage: ${percentage}%`];
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Responses",
              font: {
                weight: "bold",
                size: 12,
              },
            },
            ticks: {
              precision: 0,
            },
          },
          x: {
            title: {
              display: true,
              text: "Values",
              font: {
                weight: "bold",
                size: 12,
              },
            },
            ticks: {
              font: {
                size: 10,
              },
            },
          },
        },
      } as ChartOptions<"bar">;
    });

    return {
      chartData,
      chartOptions,
    };
  },
});
</script>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
  padding: 5px;
}
</style>
