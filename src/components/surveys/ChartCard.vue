<template>
  <b-card class="h-100 shadow">
    <b-container fluid>
      <b-row>
        <b-col cols="12" lg="4" class="title-col">
          <b-card-title>
            <span class="question-id">{{ id }} – </span>
            <span class="question-title">{{ question }}</span>
          </b-card-title>

          <b-card-text class="mb-0">
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
                {{ answer.name }}
                <strong>({{ answer.value }})</strong>
              </span>
            </p>
          </b-card-text>
        </b-col>
        <b-col cols="12" lg="3" class="doughnut-col">
          <div class="px-2 py-4">
            <doughnut-chart :counters="counters" />
          </div>
        </b-col>
        <b-col cols="12" lg="5" class="px-4 line-col">
          <div class="py-4">
            <line-chart :data="data" :isLogicalTime="useLogicalTime" />
          </div>
        </b-col>
      </b-row>
    </b-container>
  </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import LineChart from "@/components/surveys/LineChart.vue";
import PieChart from "@/components/surveys/PieChart.vue";
import DoughnutChart from "@/components/surveys/DoughnutChart.vue";
import { ChartData } from "chart.js";
import colors from "./colors";

@Component({
  components: {
    LineChart,
    PieChart,
    DoughnutChart,
  },
})
export default class LineChartComponent extends Vue {
  @Prop({ type: String, default: () => "" })
  question!: string;

  @Prop({ type: String, default: () => [] })
  id!: string;

  @Prop({ type: Array, default: () => [] })
  counters!: [];

  @Prop({ type: Object })
  data!: ChartData<"line">;

  @Prop({ type: Boolean, default: () => false })
  useLogicalTime!: boolean;

  get bcolors(): string[] {
    return colors;
  }
}
</script>
