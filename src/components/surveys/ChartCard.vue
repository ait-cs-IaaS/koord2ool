<template>
  <v-card>
    <v-container fluid>
      <v-row class="chartrow">
        <v-col cols="12" lg="4">
          <v-card-title>
            <v-tooltip location="top">
              <template #activator="{ props }">
                <span v-bind="props">
                  <span class="question-id">{{ questionKey }} – </span>
                  <span class="question-title">{{ questionText }}</span>
                </span>
              </template>
              <span>Question type: {{ questionType }}</span>
            </v-tooltip>
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
            <candlestick-chart :chartjs-data="numericalChartData" :question-key="questionKey" />
          </div>
          <div v-else class="py-4">
            <line-chart :chartjs-data="chartjsdata" :question-type="questionType" :question-key="questionKey" />
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
import { computed, defineComponent } from "vue";
import { getQuestionText, countResponsesFor, createTimelineFor, createNumericChartData } from "../../helpers/chartFunctions";
import { useSurveyStore } from "../../store/surveyStore";

export default defineComponent({
  name: "ChartCard",
  components: {
    LineChart,
    DoughnutChart,
    CandlestickChart,
  },
  props: {
    questionKey: { type: String, required: true },
  },
  setup(props) {
    const store = useSurveyStore();

    const questionText = computed(() => {
      return getQuestionText(props.questionKey);
    });

    const counters = computed(() => {
      return countResponsesFor(props.questionKey);
    });

    const questionType = computed(() => {
      return store.getQuestionType(props.questionKey);
    });

    const chartjsdata = computed(() => {
      return createTimelineFor(props.questionKey);
    });

    const numericalChartData = computed(() => {
      return createNumericChartData(props.questionKey);
    });

    return {
      questionText,
      counters,
      numericalChartData,
      chartjsdata,
      questionType,
    };
  },
});
</script>

<style scoped>
.chartrow {
  border-bottom: 1px solid #e0e0e0;
}

.line-col {
  min-height: 350px;
}
</style>
