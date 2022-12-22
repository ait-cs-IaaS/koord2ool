<template>
  <b-card no-body class="survey-results-outer-container">
    <b-tabs v-model="tabIndex" pills card>
      <template #tabs-end>
        <b-button
          class="ml-auto"
          variant="info"
          :pressed="showOptions"
          @click="showOptions = !showOptions"
        >
          <b-icon icon="gear" aria-hidden="true" class="mr-2"></b-icon>
          Display options
          <b-icon
            icon="chevron-down"
            aria-hidden="true"
            class="ml-2 display-options-icon"
            :class="{ active: showOptions }"
          ></b-icon>
        </b-button>
      </template>
      <b-tab title="Charts">
        <template #title>
          <b-icon
            icon="clipboard-data"
            aria-hidden="true"
            class="mr-2"
          ></b-icon>
          <strong>Charts</strong>
        </template>

        <charts
          :questionKeys="questionKeys"
          :responses="responses"
          :questions="questions"
          :participants="participants"
          :showOptions="showOptions"
          :from="from"
          :until="until"
        ></charts>
      </b-tab>

      <b-tab title="Tabular" class="px-1">
        <template #title>
          <b-icon icon="table" aria-hidden="true" class="mr-2"></b-icon>
          <strong>Table</strong>
        </template>

        <tabular
          :show-keys="questionKeys"
          :responses="responses"
          :participants="participants"
          :showOptions="showOptions"
          sort-key="submitdate"
        />
      </b-tab>
      <b-tab title="PDF_Statistics" class="px-1">
        <template #title>
          <b-icon icon="file-pdf" aria-hidden="true" class="mr-2"></b-icon>
          <strong>PDF Statistics</strong>
        </template>

        <a :href="blobURL" download="statistics.pdf" target="_blank"
          >PDF Statistics</a
        >
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator";
import LineChart from "@/components/surveys/LineChart.vue";
import PieChart from "@/components/surveys/PieChart.vue";
import Tabular from "@/components/surveys/Tabular.vue";
import Charts from "@/components/surveys/Charts.vue";
import ResponseModel, {
  getQuestionsFromResponses,
} from "@/store/response.model";
import QuestionModel from "@/store/question.model";
import SurveyModel from "@/store/survey.model";
import { ParticipantModel } from "@/store/participant.model";

@Component({
  components: {
    LineChart,
    PieChart,
    Tabular,
    Charts,
  },
})
export default class Survey extends Vue {
  showOptions = false;
  chartDisplayOptions = false;
  tableDisplayOptions = false;
  tabIndex = 0;

  @Prop({ type: Boolean, default: false })
  useLogicalTime!: boolean;

  @Prop({ type: Object, default: () => [] })
  questions!: Record<string, QuestionModel>;

  @Prop({ type: Array, default: () => [] })
  responses!: ResponseModel[];

  @Prop({ type: Object, required: true })
  survey!: SurveyModel;

  @Prop({ type: Array, default: () => [] })
  participants!: ParticipantModel[];

  @Prop({ type: Date, default: () => new Date() })
  from!: Date;

  @Prop({ type: Date, default: () => new Date() })
  until!: Date;

  blobURL = "";

  @Watch("tabIndex")
  onTabChange(tab: number): void {
    if (tab === 2) {
      this.setSurveyBlob();
    }
  }

  async setSurveyBlob(): Promise<void> {
    const blob = await this.$store.state.limesurvey.exportStatistics(
      this.survey.sid
    );
    this.blobURL = URL.createObjectURL(blob);
  }

  get questionKeys(): string[] {
    return Array.from(
      new Set<string>(
        this.responses
          .map((response) => Object.keys(getQuestionsFromResponses(response)))
          .flat()
      )
    ).sort();
  }

  get questionTexts(): Record<string, string> {
    return getQuestionsFromResponses(this.responses[0]);
  }
}
</script>
