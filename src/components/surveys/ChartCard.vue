<template>
  <v-card class="h-100 shadow">
    <v-container fluid>
      <v-row>
        <v-col cols="12" lg="4" class="title-col">
          <v-card-title>
            <span class="question-id">{{ id }} – </span>
            <span class="question-title">{{ question }}</span>
          </v-card-title>

          <v-card-text class="mb-0">
            <p
              v-for="(answer, index) in counters"
              :key="index"
              class="legend-row mb-2"
            >
              <span
                class="legend-color"
                :style="{ 'background-color': bcolors[index % bcolors.length] }"
              ></span>
              <span class="legend-label">
                {{ answer["name"] }}
                <strong>({{ answer["value"] }})</strong>
              </span>
            </p>
          </v-card-text>
        </v-col>
        <v-col cols="12" lg="3" class="doughnut-col">
          <div class="px-2 py-4">
            <doughnut-chart :counters="counters" />
          </div>
        </v-col>
        <v-col cols="12" lg="5" class="px-4 line-col">
          <div class="py-4">
            <line-chart
              :chartjsData="chartjsdata"
              :isLogicalTime="useLogicalTime"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import LineChart from "@/components/surveys/LineChart.vue";
import DoughnutChart from "@/components/surveys/DoughnutChart.vue";
import { ChartData } from "chart.js";
import colors from "./colors";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChartCard",
  components: {
    LineChart,
    DoughnutChart,
  },
  props: {
    question: { type: String, default: "" },
    id: { type: String, default: "" },
    counters: {
      type: Array as () => { name: string; value: number }[],
      default: () => [],
    },
    chartjsdata: {
      type: Object as () => ChartData<"line">,
      default: () => ({} as ChartData<"line">),
    },
    useLogicalTime: { type: Boolean, default: false },
  },
  computed: {
    bcolors(): string[] {
      return colors;
    },
  },
});
</script>
