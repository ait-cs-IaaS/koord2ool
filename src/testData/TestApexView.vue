<template>
  <v-container>
    <v-row class="py-4" style="max-height: 1200px">
      <v-col cols="12">
        <h2>REFERENCE</h2>
      </v-col>
      <v-col cols="6">
        <h3>Percentage</h3>
        <apexchart
          width="800"
          type="area"
          :options="optionsPercent"
          :series="seriesPercent"
        />
      </v-col>
      <v-col cols="6">
        <h3>Fixed Value</h3>
        <apexchart
          class="mt-5"
          width="800"
          type="area"
          :options="options"
          :series="series"
        />
      </v-col>
    </v-row>

    <v-row class="py-4" style="max-height: 1200px">
      <v-col cols="12">
        <h2>TESTDATA</h2>
        <apexchart
          class="mt-5"
          width="800"
          type="area"
          :options="options"
          :series="testData"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount } from "vue";
import { chartData1 as series, chartDataX } from "./chartFunctionsTestData";
import { createTimelineFor } from "../helpers/chartFunctions";
import {
  surveyList1,
  questionList1,
  responses1,
} from "../testData/chartFunctionsTestData";
import { koordStore } from "../store";
import { storeToRefs } from "pinia";
import { areaChartOptions as options } from "../components/surveys/line-options-apex";

export default defineComponent({
  name: "TestApexView",
  setup() {
    const optionsPercent = JSON.parse(JSON.stringify(options));

    optionsPercent.chart.stackType = "100%";

    const seriesPercent = series.map((serie) => ({
      ...serie,
      data: serie.data.map(([timestamp, value]) => [timestamp, value * 50]),
    }));

    const store = koordStore();
    const { responseRange } = storeToRefs(store);
    store.updateSurveyList(surveyList1);
    store.updateQuestions(surveyList1[0].sid, questionList1);
    store.settings.expirationTime = 7;
    responseRange.value = [0, new Date("2023-03-01 11:57:52").getTime()];
    store.responses[123456] = responses1;
    const testData = createTimelineFor("G01Q01HO", 123456);

    onBeforeUnmount(() => {
      store.reset();
    });

    return {
      testData,
      series,
      seriesPercent,
      options,
      optionsPercent,
      chartDataX,
    };
  },
});
</script>
