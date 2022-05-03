<template>
  <main class="survey">
    <b-row
      class="survey-header"
      :class="{
        'survey-active': surveyActive,
        'survey-inactive': !surveyActive,
      }"
    >
      <b-col cols="12" md="6">
        <h2>
          <b-badge
            pill
            :variant="surveyActive ? 'success' : 'danger'"
            class="mr-2"
          >
            {{ surveyId }}
          </b-badge>
          <span class="survey-title" v-if="survey">{{
            survey.surveyls_title
          }}</span>
        </h2>
      </b-col>
      <b-col cols="12" md="6">
        <time-slider
          v-model="showResponsesUntil"
          :min="minResponseDate"
          :max="maxResponseDate"
        />
      </b-col>
    </b-row>
    <b-row class="survey-meta">
      <b-col cols="12" md="6">
        <!-- left side -->
        <ul class="list-unstyled">
          <li v-if="survey.startdate">Start: {{ survey.startdate }}</li>
          <li v-if="survey.expires">Expiry: {{ survey.expires }}</li>
        </ul>
      </b-col>
      <b-col cols="12" md="6">
        <!-- right side -->
        <ul class="list-unstyled">
          <li>{{ questionCount }} answer(s)</li>
          <!-- TODO: add response count, or other metadata? -->
        </ul>
      </b-col>
    </b-row>
    <b-row class="survey-responses">
      <b-col>
        <survey v-if="hasResponses" :survey-id="surveyId" />
        <b-alert v-else variant="danger">No responses yet.</b-alert>
      </b-col>
    </b-row>
  </main>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import SurveyModel from "@/store/survey.model";
import QuestionModel from "@/store/question.model";
import Survey from "@/components/surveys/Survey.vue";
import TimeSlider from "@/components/TimeSlider.vue";
import ResponseModel from "@/store/response.model";

@Component({
  components: {
    Survey,
    TimeSlider,
  },
})
export default class SurveyView extends Vue {
  get questionCount(): number {
    return Object.keys(this.questions).length;
  }

  get questions(): Record<string, QuestionModel> {
    const survey = this.survey;
    if (
      typeof survey !== "undefined" &&
      typeof survey.questions !== "undefined"
    ) {
      return survey.questions;
    }
    return {};
  }

  get hasResponses(): boolean {
    return this.responses.length > 0;
  }

  get responses(): ResponseModel[] {
    return Array.isArray(this.$store.state.responses[this.surveyId])
      ? this.$store.state.responses[this.surveyId]
      : [];
  }

  get survey(): SurveyModel | undefined {
    return this.$store.state.surveys[this.surveyId];
  }

  get surveyActive(): boolean {
    return typeof this.survey !== "undefined" && this.survey.active === "Y";
  }

  get surveyId(): number {
    const { surveyId } = this.$route.params;
    return Number(surveyId);
  }

  get minResponseDate(): Date {
    return this.responses
      .map((response) =>
        response.TIME
          ? new Date(response.TIME)
          : new Date(response.submitdate || new Date())
      )
      .reduce((min, date) => (date < min ? date : min), new Date());
  }

  get maxResponseDate(): Date {
    return this.responses
      .map((response) =>
        response.TIME
          ? new Date(response.TIME)
          : new Date(response.submitdate || new Date())
      )
      .reduce((max, date) => (date > max ? date : max), new Date());
  }

  showResponsesUntil = new Date();
}
</script>

<style>
@media print {
  .pie-chart {
    max-height: 8rem;
    max-width: 8rem;
  }

  .avoid-page-break {
    page-break-inside: avoid;
  }
}
</style>
