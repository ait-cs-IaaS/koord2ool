<template>
  <v-container>
    <div class="py-4" style="max-height: 600px">
      <h2>TEST DATA</h2>
      <line-chart :chartjs-data="chartData1" question-type="yesno" />
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LineChart from "../components/surveys/LineChart.vue";
import { chartData1 } from "./chartFunctionsTestData";

export default defineComponent({
  name: "PidraKin",
  components: {
    LineChart,
  },
  setup() {
    return {
      chartData1,
    };
  },
});
</script>
