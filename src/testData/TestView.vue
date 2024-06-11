<template>
  <v-container>
    <v-row class="py-4" style="max-height: 1200px">
      <v-col cols="12" class="mb-5">
        <Slider
          v-model="responseRange"
          :min="new Date('2023-01-01').getTime()"
          :max="new Date('2023-12-31').getTime()"
          :step="24 * 60 * 60 * 1000"
          :format="tooltipFormater"
          @change="reCalcTestData"
        />
      </v-col>
      <v-col cols="12">
        <h2>REFERENCE</h2>
        <line-chart
          :data="testData"
          style="max-height: 600px"
          :options="areaChartOptions"
        />
      </v-col>
    </v-row>

    <v-row class="py-4" style="max-height: 1200px">
      <v-col cols="12">
        <h2>TEST</h2>
        <line-chart
          :data="chartDataX"
          style="max-height: 600px"
          :options="areaChartOptions"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref } from "vue";
import { Line as LineChart } from "vue-chartjs";
import Slider from "@vueform/slider";
import { chartData1 as series, chartDataYesNo } from "./chartFunctionsTestData";
import { createTimelineFor } from "../helpers/chartFunctions";
import {
  surveyList1,
  questionList1,
  responses1,
} from "../testData/chartFunctionsTestData";
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
import { koordStore } from "../store";
import { storeToRefs } from "pinia";
import { areaChartOptions } from "../components/surveys/line-options";
import { tooltipFormater } from "../helpers/slider";

import "chartjs-adapter-moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  TimeSeriesScale,
  Filler,
  Title,
  Tooltip,
  Legend,
);

export default defineComponent({
  name: "PidraKin",
  components: {
    LineChart,
    Slider,
  },
  setup() {
    const store = koordStore();
    const { responseRange } = storeToRefs(store);
    store.updateSurveyList(surveyList1);
    store.updateQuestions(surveyList1[0].sid, questionList1);
    store.settings.expirationTime = 7;
    store.responses[123456] = responses1;
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
      tooltipFormater,
      reCalcTestData,
    };
  },
});
</script>

<style src="@vueform/slider/themes/default.css"></style>
