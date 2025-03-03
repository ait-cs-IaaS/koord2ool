<template>
  <v-card class="chart-card mb-6">
    <v-container fluid class="pa-4">
      <v-row class="chartrow align-stretch">
        <v-col cols="12" class="px-3 py-1">
          <v-card-title>
            <span class="question-id">{{ questionKey }} – </span>
            <span class="question-title">{{ questionText }}</span>
          </v-card-title>
        </v-col>

        <v-col cols="12" class="d-flex flex-wrap">
          <div v-if="questionType === 'numerical'" class="chart-container histogram-chart px-2">
            <histogram-chart
              v-if="store.settings.timeFormat === 'real'"
              :chartjs-data="chartData"
              :question-type="questionType"
              :question-key="questionKey"
            />
          </div>
          <div v-else class="chart-container doughnut-chart px-2">
            <doughnut-chart v-if="counters.length > 0" :counters="counters" />
            <div v-else class="no-data">No data available</div>
          </div>

          <div class="chart-container line-chart px-2">
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

    const chartData = computed(() => {
      try {
        return createActiveNumericalData(props.questionKey);
      } catch (e) {
        console.error("Error preparing chart data:", e);
        return { labels: [], datasets: [] };
      }
    });

    return {
      store,
      questionText,
      counters,
      chartjsdata,
      questionType,
      chartData
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

.histogram-chart {
  width: 40%;
}

.line-chart {
  width: 60%;
}

.doughnut-chart {
  width: 40%;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 16px;
  color: #666;
}

.question-title {
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  display: inline-block;
  line-height: 1.4;
}

@media (max-width: 1263px) {
  .chart-container {
    height: 280px;
  }
}

@media (max-width: 959px) {
  .histogram-chart, .doughnut-chart, .line-chart {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>
