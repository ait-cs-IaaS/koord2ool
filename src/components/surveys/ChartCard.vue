<template>
  <v-card class="chart-card mb-6">
    <v-container fluid class="pa-3">
      <v-row class="chartrow align-stretch">
        <v-col cols="12" class="px-3 py-2">
          <v-card-title class="px-0 py-1">
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
        </v-col>
        <v-col cols="12" class="d-flex flex-wrap pt-0 pb-3">
          <div v-if="questionType === 'numerical'" class="chart-container histogram-chart px-2">
            <histogram-chart :chartjs-data="chartData" :question-type="questionType" :question-key="questionKey" />
          </div>
          <div v-else-if="isTextQuestion" class="chart-container word-cloud-chart px-2">
            <word-cloud-chart :raw-responses="freeTextResponses" />
          </div>
          <div v-else class="chart-container doughnut-chart px-2">
            <doughnut-chart v-if="counters.length > 0" :counters="counters" />
            <div v-else class="no-data">No data available</div>
          </div>

          <div class="chart-container line-chart px-2">
            <candlestick-chart v-if="questionType === 'numerical'" :chartjs-data="numericChartData" :question-key="questionKey" />
            <line-chart v-else :chartjs-data="chartjsdata" :question-type="questionType" :question-key="questionKey" />
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
import CandlestickChart from "./CandlestickChart.vue";
import WordCloudChart from "./WordCloudChart.vue";
import { computed, defineComponent } from "vue";
import {
  getQuestionText,
  countResponsesFor,
  createTimelineFor,
  createActiveNumericalData,
  createNumericChartData,
} from "../../helpers/chartFunctions";
import { isFreeTextQuestion } from "../../helpers/questionMapping";
import { prepareWordCloudData } from "../../helpers/wordcloud-charts";
import { useSurveyStore } from "../../store/surveyStore";

export default defineComponent({
  name: "ChartCard",
  components: {
    LineChart,
    DoughnutChart,
    HistogramChart,
    CandlestickChart,
    WordCloudChart,
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

    const isTextQuestion = computed(() => {
      return isFreeTextQuestion(questionType.value);
    });

    const freeTextResponses = computed(() => {
      if (!isTextQuestion.value) return [];
      console.debug("Getting free text responses for:", props.questionKey);
      return prepareWordCloudData(store.getFilteredResponses(props.questionKey));
    });

    const chartjsdata = computed(() => {
      return createTimelineFor(props.questionKey);
    });

    const chartData = computed(() => {
      try {
        return createActiveNumericalData(props.questionKey);
      } catch (e) {
        console.error("Error preparing chart data:", e);
        return { labels: [], datasets: [] };
      }
    });

    const numericChartData = computed(() => {
      try {
        return createNumericChartData(props.questionKey);
      } catch (e) {
        console.error("Error preparing candlestick data:", e);
        return { datasets: [] };
      }
    });

    return {
      store,
      questionText,
      counters,
      chartjsdata,
      questionType,
      chartData,
      numericChartData,
      isTextQuestion,
      freeTextResponses,
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

.chart-container {
  height: 320px;
  position: relative;
}

.histogram-chart,
.word-cloud-chart {
  width: 39%;
  margin-right: 1%;
}

.line-chart {
  width: 59%;
}

.doughnut-chart {
  width: 39%;
  margin-right: 1%;
  margin-left: 1%;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  color: #666;
}

.question-title {
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  display: inline-block;
  line-height: 1.3;
  font-size: 16px;
}

.question-id {
  font-size: 16px;
}

.v-card-title {
  display: block;
  overflow: visible;
  white-space: normal;
  font-size: 16px;
  line-height: 1.3;
}

@media (max-width: 1263px) {
  .chart-container {
    height: 280px;
  }
}

@media (max-width: 959px) {
  .histogram-chart,
  .doughnut-chart,
  .word-cloud-chart,
  .line-chart {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>
