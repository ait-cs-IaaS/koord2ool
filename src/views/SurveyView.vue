<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h5>
          {{ surveyId }}
        </h5>
        <h1 class="survey-title" v-if="survey">
          {{ survey.surveyls_title }}
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <time-slider
          v-model:inputRange="responseRange as rangeArray"
          :minDate="minResponseDate"
          :maxDate="maxResponseDate"
          v-if="hasResponseDates"
        />
        <v-row v-if="!hasResponseDates">
          <v-col>
            Responses have no responseDate set.
            <a
              href="https://help.limesurvey.org/portal/en/kb/articles/survey-activation"
              target="_blank"
              >Info</a
            >
          </v-col>
        </v-row>
        <v-row v-if="hasResponses">
          <v-col>
            showing {{ responsesInTimeline.length }} of
            {{ responses.length }} answer(s)
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">Number of questions</v-col>
          <v-col cols="2">{{ questionCount }}</v-col>
        </v-row>
        <v-row v-if="survey.startdate !== null">
          <v-col cols="2">Start</v-col>
          <v-col cols="2">{{ survey.startdate }}</v-col>
        </v-row>
        <v-row v-if="survey.expires !== null">
          <v-col cols="2">Expires</v-col>
          <v-col cols="2">{{ survey.expires }}</v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
      <survey-component
        v-if="hasResponses"
        :survey="survey"
        :responses="responsesInTimeline"
        :questions="questions"
        :participants="participants"
        :until="untilDate"
        :from="fromDate"
        :useLogicalTime="!hasResponseDates"
      />
      <v-alert v-else type="error">No responses yet.</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SurveyModel from "../store/survey.model";
import { QuestionModel } from "../store/question.model";
import SurveyComponent from "../components/surveys/Survey.vue";
import TimeSlider from "../components/TimeSlider.vue";
import { ResponseModel } from "../store/response.model";
import { ParticipantModel } from "../store/participant.model";

import { defineComponent } from "vue";

interface rangeArray extends Array<Date> {
  length: 2;
}

export default defineComponent({
  name: "SurveyView",

  components: {
    SurveyComponent,
    TimeSlider,
  },

  computed: {
    questionCount(): number {
      return Object.keys(this.questions).length;
    },

    questions(): Record<string, QuestionModel> {
      const survey = this.survey;
      if (
        typeof survey !== "undefined" &&
        typeof survey.questions !== "undefined"
      ) {
        return survey.questions;
      }
      console.warn("No questions found for survey", this.surveyId);
      return {};
    },

    hasResponses(): boolean {
      return this.responses.length > 0;
    },

    participants(): ParticipantModel[] {
      return this.$store.getters.getParticipants(this.surveyId);
    },

    responses(): ResponseModel[] {
      return this.$store.getters.getResponses(this.surveyId);
    },

    fromDate(): Date {
      return typeof this.responseRange[0] !== "undefined"
        ? this.responseRange[0]
        : this.minResponseDate;
    },

    untilDate(): Date {
      return typeof this.responseRange[1] !== "undefined"
        ? this.responseRange[1]
        : this.maxResponseDate;
    },

    responsesInTimeline(): ResponseModel[] {
      return this.responses.filter((response) => {
        const thisTime = new Date(response.submitdate);
        return this.fromDate <= thisTime && thisTime <= this.untilDate;
      });
    },

    submitDates(): string[] {
      return this.responses.map((response) => response.submitdate);
    },

    survey(): SurveyModel {
      return this.$store.getters.getSurvey(this.surveyId);
    },

    surveyActive(): boolean {
      return typeof this.survey !== "undefined" && this.survey.active === "Y";
    },

    surveyId(): number {
      const { surveyId } = this.$route.params;
      return Number(surveyId);
    }
  },
  data: function () {
    return {
      minResponseDate: new Date(),
      maxResponseDate: new Date(),
      hasResponseDates: false,
      responseRange: [new Date(), new Date()],
    };
  },

  async beforeMount(): Promise<void> {
    await this.$store.dispatch("refreshSurvey", this.surveyId);
  },

  mounted(): void {
    // This shouldn't happen, but it does :(
    if (typeof this.survey === "undefined") {
      throw new Error("Couldn't find a local copy of the survey.");
    }
    this.minResponseDate = this.$store.getters.getMinResponseDate()
    this.maxResponseDate = this.$store.getters.getMaxResponseDate()
    this.hasResponseDates = this.$store.getters.hasSubmitDateMatch()
    this.responseRange = [this.minResponseDate, this.maxResponseDate]
  },

  watch: {
    // $route: fucnonRouteChange(): Promise<void> {
    // await this.$store.dispatch("refreshSurvey", this.surveyId);
  },

  methods: {
    async refresh(): Promise<void> {
      await this.$store.dispatch("refreshSurvey", this.surveyId);
    },
  },
});
</script>
