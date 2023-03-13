<template>
  <v-card>
    <v-tabs v-model="tab" grow>
      <v-tab title="Charts" value="charts" />
      <v-tab title="Tabular" value="tabular" />
      <v-tab title="PDF Statistics" value="stats" />
    </v-tabs>
    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="charts">
          <charts
            :questionKeys="questionKeys"
            :responses="responses"
            :questions="questions"
            :participants="participants"
            :showOptions="showOptions"
            :from="from"
            :until="until"
          ></charts>
        </v-window-item>

        <v-window-item value="tabular">
          <!-- <tabular
            :show-keys="questionKeys"
            :responses="responses"
            :participants="participants"
            :showOptions="showOptions"
            sort-key="submitdate"
          /> -->
        </v-window-item>

        <v-window-item value="stats">
          <h4>
            Below you can Download a PDF export from
            <a href="https://manual.limesurvey.org/Statistics" target="_blank">
              LimeSurvey Staistic Endpoint
            </a>
            The content of this PDF can only be changed via LimeSurvey.
            <v-btn
              class="mt-3"
              :href="blobURL"
              :download="pdfFileName"
              target="_blank"
            >
              PDF Statistics
            </v-btn>
          </h4>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
// import Tabular from "@/components/surveys/Tabular.vue";
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
    // Tabular,
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
      tab: "",
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
    tab(tab: number) {
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
