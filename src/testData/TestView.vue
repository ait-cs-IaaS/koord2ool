<template>
  <v-container>
    <v-row>
      <display-options :options="chartOptions" />
    </v-row>
    <v-row class="py-4" style="max-height: 1200px">
      <v-btn text="Refresh" @click="reCalcTestData" />
      <v-col cols="12">
        <h2>REFERENCE</h2>
        <line-chart :data="testData" style="max-height: 600px" :options="areaChartOptions" />
      </v-col>
    </v-row>

    <v-row class="py-4" style="max-height: 1200px">
      <v-col cols="12">
        <h2>TEST</h2>
        <line-chart :data="chartDataX" style="max-height: 600px" :options="areaChartOptions" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { Line as LineChart } from "vue-chartjs";
import DisplayOptions from "../components/surveys/DisplayOptions.vue";
import { chartDataYesNo } from "./chartFunctionsTestData";
import { createTimelineFor } from "../helpers/chartFunctions";
import { surveyList1, questionList1, responses1 } from "../testData/chartFunctionsTestData";
import { areaChartOptions } from "../components/surveys/chart-options";
import { chartOptions } from "../components/surveys/options";
import type { ChartData } from "chart.js";
import { useSurveyStore } from "../store/surveyStore";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale,
  Filler,
} from "chart.js";
import "chartjs-adapter-moment";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, TimeSeriesScale, Filler, Title, Tooltip, Legend);

// Initialize Store
const store = useSurveyStore();

store.updateSurveyList(surveyList1);
store.updateQuestions(surveyList1[0].sid, questionList1);
store.settings.expirationTime = 7;
store.responses[123456] = responses1;
store.responseRange = [new Date("2023-02-10").getTime(), new Date("2023-05-31").getTime()];
store.selectedSurveyID = 123456;

// Reactive refs with explicit types
const testData = ref<ChartData<"line">>(createTimelineFor("G01Q01HO"));

// Simplified recalculation
const reCalcTestData = () => {
  testData.value = createTimelineFor("G01Q01HO");
};

// Lifecycle hooks
onBeforeUnmount(() => {
  store.reset();
});

// Static imports assigned directly
const chartDataX = chartDataYesNo;
</script>

<style src="@vueform/slider/themes/default.css"></style>
