<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default defineComponent({
  name: "HistogramChart",
  components: { Bar },
  props: {
    chartjsData: {
      type: Object,
      required: true
    },
    questionType: {
      type: String,
      required: true
    },
    questionKey: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const chartData = computed(() => {
      if (!props.chartjsData || !props.chartjsData.datasets) {
        return { labels: [], datasets: [] };
      }
      
      return {
        labels: props.chartjsData.labels || [],
        datasets: props.chartjsData.datasets
      };
    });

    const totalResponses = computed(() => {
      if (!props.chartjsData || !props.chartjsData.datasets || !props.chartjsData.datasets[0]) {
        return 0;
      }
      
      return props.chartjsData.datasets[0].data.reduce((sum, value) => sum + (Number(value) || 0), 0);
    });

    const chartOptions = computed(() => {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: props.chartjsData.title ? true : false,
            text: props.chartjsData.title || "",
            font: {
              size: 14,
              weight: "bold"
            }
          },
          subtitle: {
            display: props.chartjsData.subtitle ? true : false,
            text: props.chartjsData.subtitle || "",
            font: {
              size: 12
            },
            padding: {
              bottom: 10
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title(tooltipItems) {
                return `${tooltipItems[0].label}`;
              },
              label(context) {
                const count = context.parsed.y;
                const percentage = totalResponses.value > 0 
                  ? ((count / totalResponses.value) * 100).toFixed(1) 
                  : "0";
                
                return [
                  `Count: ${count} out of ${totalResponses.value}`,
                  `Percentage: ${percentage}%`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Responses",
              font: {
                weight: "bold",
                size: 12
              }
            },
            ticks: {
              precision: 0
            }
          },
          x: {
            title: {
              display: true,
              text: "Values",
              font: {
                weight: "bold",
                size: 12
              }
            },
            ticks: {
              font: {
                size: 10
              },
            }
          }
        }
      };
    });

    return {
      chartData,
      chartOptions
    };
  }
});
</script>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
  padding: 5px;
}
</style>