<template>
  <main class="survey">
    <b-row
      class="survey-header"
      :class="{
        'survey-active': surveyActive,
        'survey-inactive': !surveyActive,
      }"
    >
      <b-col cols="12" md="12" class="pb-4">
        <h5>
          <b-badge
            pill
            small
            :variant="surveyActive ? 'success' : 'danger'"
            class="mr-2 text-white"
          >
            {{ surveyId }}
          </b-badge>
        </h5>
        <h1 class="survey-title" v-if="survey">
          {{ survey.surveyls_title }}
        </h1>
        <hr />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <ul class="list-unstyled">
          <li v-if="survey.startdate">Start: {{ survey.startdate }}</li>
          <li v-if="survey.expires">Expires: {{ survey.expires }}</li>
        </ul>

        <b-card class="time-slider-container mb-5 shadow d-print-none">
          <time-slider
            v-model="responseRange"
            :min="minResponseDate"
            :max="maxResponseDate"
            :disabled="!hasResponses"
          />

          <ul class="list-unstyled">
            <li>{{ questionCount }} question(s)</li>
            <li v-if="hasResponses">
              showing {{ responsesInTimeline.length }} of
              {{ responses.length }} answer(s)
            </li>
          </ul>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="survey-responses">
      <b-col>
        <survey
          v-if="hasResponses"
          :survey="survey"
          :responses="responsesInTimeline"
          :questions="questions"
          :participants="participants"
          :until="untilDate"
          :from="fromDate"
        />
        <b-alert v-else variant="danger">No responses yet.</b-alert>
      </b-col>
    </b-row>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SurveyModel from "@/store/survey.model";
import QuestionModel from "@/store/question.model";
import Survey from "@/components/surveys/Survey.vue";
import TimeSlider from "@/components/TimeSlider.vue";
import ResponseModel from "@/store/response.model";
import { ParticipantModel } from "@/store/participant.model";

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

  get participants(): ParticipantModel[] {
    return Array.isArray(this.$store.state.participants[this.surveyId])
      ? this.$store.state.participants[this.surveyId]
      : [];
  }

  get responses(): ResponseModel[] {
    return Array.isArray(this.$store.state.responses[this.surveyId])
      ? this.$store.state.responses[this.surveyId]
      : [];
  }

  get responsesInTimeline(): ResponseModel[] {
    return this.responses.filter((response) => {
      return (
        this.fromDate <= new Date(response.TIME) &&
        new Date(response.TIME) <= this.untilDate
      );
    });
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
      .map((response) => new Date(response.TIME))
      .reduce((min, date) => (date < min ? date : min), new Date());
  }

  get maxResponseDate(): Date {
    return this.responses
      .map((response) => new Date(response.TIME))
      .reduce((max, date) => (date > max ? date : max));
  }

  responseRange = [];

  get fromDate(): Date {
    return typeof this.responseRange[0] !== "undefined"
      ? this.responseRange[0]
      : this.minResponseDate;
  }

  get untilDate(): Date {
    return typeof this.responseRange[1] !== "undefined"
      ? this.responseRange[1]
      : this.maxResponseDate;
  }

  async beforeMount(): Promise<void> {
    await this.$store.dispatch("refreshResponses", this.surveyId);
  }
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
