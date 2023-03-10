<template>
  <v-card no-body class="survey-results-outer-container">
    <b-tabs v-model="tabIndex" pills card>
      <template #tabs-end>
        <v-button
          class="ml-auto"
          variant="info"
          :pressed="showOptions"
          @click="showOptions = !showOptions"
        >
          <v-icon icon="gear" aria-hidden="true" class="mr-2"></v-icon>
          Display options
          <v-icon
            icon="chevron-down"
            aria-hidden="true"
            class="ml-2 display-options-icon"
            :class="{ active: showOptions }"
          ></v-icon>
        </v-button>
      </template>
      <b-tab title="Charts">
        <template #title>
          <v-icon
            icon="clipboard-data"
            aria-hidden="true"
            class="mr-2"
          ></v-icon>
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
          <v-icon icon="table" aria-hidden="true" class="mr-2"></v-icon>
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
          <v-icon icon="file-pdf" aria-hidden="true" class="mr-2"></v-icon>
          <strong>PDF Statistics</strong>
        </template>
        <h4>
          Below you can Download a PDF export from
          <a href="https://manual.limesurvey.org/Statistics" target="_blank"
            >LimeSurvey Staistic Endpoint</a
          >.<br />
          The content of this PDF can only be changed via LimeSurvey.<br />
          <v-button
            class="mt-3"
            :href="blobURL"
            :download="pdfFileName"
            target="_blank"
          >
            PDF Statistics
          </v-button>
        </h4>
      </b-tab>
    </b-tabs>
  </v-card>
</template>

<script lang="ts">
import Tabular from "@/components/surveys/Tabular.vue";
import Charts from "@/components/surveys/Charts.vue";
import {
  ResponseModel,
  getQuestionsFromResponses,
} from "@/store/response.model";
import { api } from "@/store";
import { QuestionModel } from "@/store/question.model";
import SurveyModel from "@/store/survey.model";
import { ParticipantModel } from "@/store/participant.model";
import { defineComponent } from "vue";

export default defineComponent({
  name: "SurveyComponent",
  components: {
    Tabular,
    Charts,
  },
  props: {
    useLogicalTime: {
      type: Boolean,
      default: false,
    },
    questions: {
      type: Object as () => Record<string, QuestionModel>,
    },
    responses: {
      type: Array<ResponseModel>,
      default: () => [],
    },
    survey: {
      type: Object as () => SurveyModel,
      required: true,
    },
    participants: {
      type: Array<ParticipantModel>,
      default: () => [],
    },
    from: {
      type: Date,
      default: () => new Date(),
    },
    until: {
      type: Date,
      default: () => new Date(),
    },
  },
  data() {
    return {
      showOptions: false,
      chartDisplayOptions: false,
      tableDisplayOptions: false,
      tabIndex: 0,
      blobURL: "",
    };
  },
  methods: {
    getQuestionText(key: string): string {
      return this.questionTexts[key];
    },
    onTabChange(tab: number): void {
      if (tab === 2) {
        this.setSurveyBlob();
      }
    },
    async setSurveyBlob(): Promise<void> {
      const blob = await api.exportStatistics(this.survey.sid);
      this.blobURL = URL.createObjectURL(blob);
    },
  },
  watch: {
    tabIndex(tab: number) {
      if (tab === 2) {
        this.setSurveyBlob();
      }
    },
  },
  computed: {
    pdfFileName(): string {
      return `statistics_${this.survey.sid}.pdf`;
    },
    questionKeys(): string[] {
      return Array.from(
        new Set<string>(
          this.responses
            .map((response) => Object.keys(getQuestionsFromResponses(response)))
            .flat()
        )
      ).sort();
    },
    questionTexts(): Record<string, string> {
      return getQuestionsFromResponses(this.responses[0]);
    },
  },
});
</script>
