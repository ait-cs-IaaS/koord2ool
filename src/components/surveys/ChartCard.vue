<template>
  <v-card class="chart-card mb-6">
    <v-container fluid class="pa-4">
      <v-row class="chartrow align-stretch">
        <v-col cols="12" lg="3" class="d-flex flex-column">
          <v-card-title class="px-3 py-2">
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
          <v-card-text class="mb-0 flex-grow-1 d-flex flex-column justify-center">
            <p v-for="(answer, index) in counters" :key="index" class="py-1">
              <span>
                {{ answer["name"] }}
                <strong>({{ answer["value"] }})</strong>
              </span>
            </p>
            <p v-if="counters.length === 0" class="text-center text-medium-emphasis">No response data available</p>
          </v-card-text>
        </v-col>

        <v-col cols="12" lg="3" class="doughnut-col d-flex align-center justify-center">
          <div v-if="questionType === 'numerical'" class="chart-container py-2">
            <histogram-chart
              v-if="store.settings.timeFormat === 'real'"
              :chartjs-data="onlyActiveNumericalData"
              :question-type="questionType"
              :question-key="questionKey"
            />
          </div>
          <div v-else-if="counters.length > 0" class="px-3 py-3 chart-container">
            <doughnut-chart :counters="counters" />
          </div>
          <div v-else class="py-3 d-flex align-center justify-center">
            <p class="text-center">No data available</p>
          </div>
        </v-col>

        <v-col cols="12" lg="6" class="line-col px-4">
          <div class="chart-container py-2">
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
import HistogramChart from "./HistogramChart.vue";
import { computed, defineComponent } from "vue";
import { getQuestionText, countResponsesFor, createTimelineFor, createActiveNumericalData } from "../../helpers/chartFunctions";
import { useSurveyStore } from "../../store/surveyStore";

export default defineComponent({
  name: "ChartCard",
  components: {
    LineChart,
    DoughnutChart,
    HistogramChart,
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
      console.debug("Computing counters for:", props.questionKey);
      return countResponsesFor(props.questionKey);
    });

    const questionType = computed(() => {
      console.debug("Computing question type for:", props.questionKey);
      return store.getQuestionType(props.questionKey);
    });

    const chartjsdata = computed(() => {
      console.debug("Computing chart data for:", props.questionKey);
      return createTimelineFor(props.questionKey);
    });

    const onlyActiveNumericalData = computed(() => {
      console.debug("Computing only active numerical data for:", props.questionKey);
      return createActiveNumericalData(props.questionKey);
    });

    return {
      store,
      questionText,
      counters,
      chartjsdata,
      questionType,
      onlyActiveNumericalData,
    };
  },
});
</script>

<style scoped>
.chart-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.chartrow {
  border-bottom: 1px solid #e0e0e0;
}

.chart-container {
  width: 100%;
  height: 320px;
  position: relative;
}

.question-title {
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  display: inline-block;
  line-height: 1.4;
  max-width: 100%;
}

.v-card-title {
  display: block;
  overflow: visible;
  white-space: normal;
  padding-right: 16px;
}

/* Responsive adjustments */
@media (max-width: 1263px) {
  .chart-container {
    height: 280px;
  }
}

@media (max-width: 959px) {
  .doughnut-col,
  .line-col {
    padding-top: 8px !important;
    padding-bottom: 24px !important;
  }

  .chart-card {
    margin-bottom: 32px;
  }
}
</style>
