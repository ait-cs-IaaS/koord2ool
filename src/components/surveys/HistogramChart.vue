<template>
  <div class="chart-container">
    <div v-if="!chartjsData || !chartjsData.datasets || chartjsData.datasets.length === 0" class="no-data">
      No data available for histogram
    </div>
    <Bar v-else :data="chartjsData" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
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

export default defineComponent({
  name: 'HistogramChart',
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
    const totalResponses = computed(() => {
      if (!props.chartjsData || 
          !props.chartjsData.datasets || 
          props.chartjsData.datasets.length === 0) {
        return 0;
      }
      return props.chartjsData.datasets[0].data.reduce(
        (a: number, b: number) => a + b, 0
      );
    });

    const maxCount = computed(() => {
      if (!props.chartjsData || 
          !props.chartjsData.datasets || 
          props.chartjsData.datasets.length === 0) {
        return 10;
      }
      
      const max = Math.max(...props.chartjsData.datasets[0].data as number[]);
      return Math.ceil(max * 1.2);
    });

    const chartTitle = computed(() => {
      if (!props.chartjsData || !props.chartjsData.title) {
        return "Value Distribution";
      }
      return props.chartjsData.title;
    });

    const chartSubtitle = computed(() => {
      return props.chartjsData.subtitle || "";
    });

    const formatYAxisTick = function(this: any, tickValue: string | number, index: number, ticks: any[]): string | number | null | undefined {
      const value = Number(tickValue);
      return Math.floor(value) === value ? value.toString() : "";
    };

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: [chartTitle.value, chartSubtitle.value],
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          display: false 
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              
              return `Value: ${items[0].label}`;
            },
            label: (item) => {
              const datasetIndex = item.datasetIndex;
              const index = item.dataIndex;
              const originalData = props.chartjsData.datasets[datasetIndex].originalData?.[index];
              
              if (originalData && originalData.percentage) {
                return [
                  `Count: ${originalData.count} of ${totalResponses.value} responses`,
                  `Percentage: ${originalData.percentage}%`
                ];
              }
              
              const count = item.parsed.y;
              const percentage = totalResponses.value > 0 
                ? ((count / totalResponses.value) * 100).toFixed(1) 
                : '0';
              
              return [
                `Count: ${count} of ${totalResponses.value} responses`,
                `Percentage: ${percentage}%`
              ];
            }
          },
          titleFont: {
            weight: 'bold',
            size: 14
          },
          bodyFont: {
            size: 13
          },
          padding: 10,
          boxPadding: 5
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Number of Responses',
            font: {
              weight: 'bold',
              size: 14
            },
            padding: {
              bottom: 10
            }
          },
          beginAtZero: true,
          max: maxCount.value,
          ticks: {
            stepSize: 1,
            precision: 0, 
            callback: formatYAxisTick,
            font: {
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Values',
            font: {
              weight: 'bold',
              size: 14
            },
            padding: {
              top: 10
            }
          },
          ticks: {
            font: {
              size: 12
            },
            maxRotation: 0,
            autoSkip: false
          },
          grid: {
            display: false
          }
        }
      },
      layout: {
        padding: {
          top: 10,
          right: 20,
          bottom: 20,
          left: 20
        }
      }
    };

    return {
      chartOptions,
      totalResponses
    };
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  background-color: #ffffff;
  border-radius: 8px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>