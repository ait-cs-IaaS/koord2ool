<template>
  <v-card>
    <v-container fluid>
      <v-row class="chartrow">
        <v-col cols="12" lg="3">
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
            <histogram-chart
              v-if="store.settings.timeFormat === 'real'"
              :chartjs-data="{
                labels: numericalChartData.labels,
                datasets: numericalChartData.datasets
              }"
              :question-type="questionType"
              :question-key="questionKey"
            />
            <line-chart
              v-else
              :chartjs-data="numericalChartData"
              :question-type="questionType"
              :question-key="questionKey"
            />
          </div>
          <div v-else class="py-4">
            <line-chart 
              :chartjs-data="chartjsdata" 
              :question-type="questionType" 
              :question-key="questionKey" 
            />
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
import { getQuestionText, countResponsesFor, createTimelineFor, createNumericChartData, } from "../../helpers/chartFunctions";
import { useSurveyStore } from "../../store/surveyStore";

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

interface ExtendedChartData {
  labels: string[];
  datasets: ChartDataset[];
}

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

    const numericalChartData = computed<ExtendedChartData>(() => {
      console.debug("Computing numerical chart data, timeFormat:", store.settings.timeFormat);
      const data = createNumericChartData(props.questionKey);
      console.debug("Received numerical chart data:", data);
      return data as ExtendedChartData;
    });

    return {
      store,
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
  min-height: 600px;
}

.doughnut-col {
  min-height: 200px;
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
</style>
