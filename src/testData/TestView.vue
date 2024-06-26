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

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref } from "vue";
import { Line as LineChart } from "vue-chartjs";
import DisplayOptions from "../components/surveys/DisplayOptions.vue";
import { chartData1 as series, chartDataYesNo } from "./chartFunctionsTestData";
import { createTimelineFor } from "../helpers/chartFunctions";
import { surveyList1, questionList1, responses1 } from "../testData/chartFunctionsTestData";
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
  ChartData,
} from "chart.js";
import { useSurveyStore } from "../store/surveyStore";
import { storeToRefs } from "pinia";
import { areaChartOptions } from "../components/surveys/line-options";
import { chartOptions } from "../components/surveys/options";

import "chartjs-adapter-moment";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, TimeSeriesScale, Filler, Title, Tooltip, Legend);

export default defineComponent({
  name: "PidraKin",
  components: {
    LineChart,
    DisplayOptions,
  },
  setup() {
    const store = useSurveyStore();
    const { responseRange } = storeToRefs(store);
    store.updateSurveyList(surveyList1);
    store.updateQuestions(surveyList1[0].sid, questionList1);
    store.settings.expirationTime = 7;
    store.responses[123456] = responses1;
    store.responseRange = [new Date("2023-02-10").getTime(), new Date("2023-05-31").getTime()];
    store.selectedSurveyID = 123456;
    const testData = ref(createTimelineFor("G01Q01HO") as ChartData<"line">);

    function reCalcTestData() {
      testData.value = createTimelineFor("G01Q01HO") as ChartData<"line">;
    }

    onBeforeUnmount(() => {
      store.reset();
    });

    return {
      testData,
      responseRange,
      series,
      chartDataX: chartDataYesNo,
      areaChartOptions,
      chartOptions,
      reCalcTestData,
    };
  },
});
</script>

<style src="@vueform/slider/themes/default.css"></style>
