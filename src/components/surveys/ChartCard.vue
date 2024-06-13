<template>
  <v-card>
    <v-container fluid>
      <v-row class="chartrow">
        <v-col cols="12" lg="4">
          <v-card-title>
            <span class="question-id">{{ id }} – </span>
            <span class="question-title">{{ question }}</span>
          </v-card-title>

          <v-card-text class="mb-0">
            <p v-for="(answer, index) in counters" :key="index">
              <span>
                {{ answer["name"] }}
                <strong>({{ answer["value"] }})</strong>
              </span>
            </p>
          </v-card-text>
        </v-col>
        <v-col cols="12" lg="3" class="doughnut-col">
          <div v-if="counters.length > 0" class="px-2 py-4">
            <doughnut-chart :counters="counters" />
          </div>
          <div v-else class="py-4">
            <p class="text-center">No data available</p>
          </div>
        </v-col>
        <v-col cols="12" lg="5" class="px-4 line-col">
          <div v-if="questionType === 'numerical'" class="py-4">
            <candlestick-chart
              :chartjs-data="chartjsdata as ChartData<'candlestick'>"
              :question-key="id"
            />
          </div>
          <div v-else class="py-4">
            <line-chart
              :chartjs-data="chartjsdata as ChartData<'line'>"
              :question-type="questionType"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import LineChart from "./LineChart.vue";
import DoughnutChart from "./DoughnutChart.vue";
import CandlestickChart from "./CandlestickChart.vue";
import { ChartData } from "chart.js";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChartCard",
  components: {
    LineChart,
    DoughnutChart,
    CandlestickChart,
  },
  props: {
    question: { type: String, default: "" },
    id: { type: String, default: "" },
    counters: {
      type: Array as () => { name: string; value: number }[],
      default: () => [],
    },
    chartjsdata: {
      type: Object as () => ChartData<"line"> | ChartData<"candlestick">,
      default: () => ({}) as ChartData<"line">,
    },
    questionType: { type: String, default: "" },
  },
});
</script>

<style scoped>
.chartrow {
  border-bottom: 1px solid #e0e0e0;
}
</style>
