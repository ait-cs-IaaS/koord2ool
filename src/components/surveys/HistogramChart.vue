// HistogramChart.vue
<template>
  <div class="chart-container">
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

type ChartProps = {
  chartjsData: any;  
  questionType: string;
  questionKey: string;
}

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
  setup(props: ChartProps) {
    const chartData = computed(() => props.chartjsData);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Frequency'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Values'
          }
        }
      }
    };

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
}
</style>