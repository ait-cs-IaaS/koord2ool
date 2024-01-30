<template>
  <v-container>
    <div class="py-4" style="max-height: 600px">
      <h2>REFERENCE</h2>
      <line-chart :chartjs-data="chartData1" question-type="yesno" />
    </div>

    <div class="py-4" style="max-height: 600px">
      <h2>TEST CHART</h2>
      <line-chart :chartjs-data="testData" question-type="yesno" />
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount } from "vue";
import LineChart from "../components/surveys/LineChart.vue";
import { chartData1 } from "./chartFunctionsTestData";
import { createTimelineFor } from "../helpers/chartFunctions";
import {
  surveyList1,
  questionList1,
  responses1,
} from "../testData/chartFunctionsTestData";
import { koordStore } from "../store";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "PidraKin",
  components: {
    LineChart,
  },
  setup() {
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
      chartData1,
      testData,
    };
  },
});
</script>
