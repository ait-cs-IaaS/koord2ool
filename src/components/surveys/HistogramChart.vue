// HistogramChart.vue
<template>
  <div class="chart-container">
    <Bar
      v-if="chartjsData"
      :data="{
        labels: chartjsData.labels,
        datasets: chartjsData.datasets.map(dataset => ({
          ...dataset,
          type: 'bar' as const
        }))
      }"
      :options="chartOptions"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface Dataset {
  data: number[];
  label: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

interface BarChartData {
  labels: string[];
  datasets: Dataset[];
}

export default defineComponent({
  name: 'HistogramChart',
  components: { Bar },
  props: {
    chartjsData: {
      type: Object as () => BarChartData,
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
    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 30,
          right: 30,
          top: 30,
          bottom: 30
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 25,
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          padding: 15,
          titleFont: {
            size: 16,
            weight: 'bold'
          },
          bodyFont: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          border: {
            display: true,
            width: 1
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          title: {
            display: true,
            text: 'Frequency',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 20,
              bottom: 20
            }
          },
          ticks: {
            padding: 12,
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          border: {
            display: true,
            width: 1
          },
          title: {
            display: true,
            text: 'Values',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 20,
              bottom: 20
            }
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            padding: 12,
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        }
      }
    };

    return {
      chartjsData: props.chartjsData,
      chartOptions
    };
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 600px !important;
  width: 100%;
  padding: 30px;
  margin: 20px 0;
}
</style>