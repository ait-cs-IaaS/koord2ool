<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h5>
          {{ surveyId }}
        </h5>
        <h1 v-if="survey">
          {{ survey.surveyls_title }}
        </h1>
      </v-col>
    </v-row>
    <v-row class="ml-6 mr-6 mt-6">
      <v-col class="ml-8 mr-8">
        <time-slider
          v-if="hasSubmitDateMatch()"
        />
        <v-row v-if="!hasSubmitDateMatch()">
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
          :useLogicalTime="!hasSubmitDateMatch()"
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
import { koordStore } from "../store";
import { mapState, mapActions } from "pinia";


export default defineComponent({
  name: "SurveyView",

  components: {
    SurveyComponent,
    TimeSlider,
  },

  computed: {
    ...mapState(koordStore, [
      "getParticipants",
      "getResponses",
      "getSurvey",
      "hasSubmitDateMatch",
      "settings",
      "fromDate",
      "untilDate",
    ]),
    maxResponseDate(): Date {
      return this.getMaxResponseDate()(this.surveyId);
    },
    minResponseDate(): Date {
      return this.getMinResponseDate()(this.surveyId);
    },
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
      return this.getParticipants(this.surveyId);
    },

    responses(): ResponseModel[] {
      return this.getResponses(this.surveyId);
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
      return this.getSurvey(this.surveyId);
    },

    surveyActive(): boolean {
      return typeof this.survey !== "undefined" && this.survey.active === "Y";
    },

    surveyId(): number {
      const { surveyId } = this.$route.params;
      return Number(surveyId);
    },
  },
  data: function () {
    return { };
  },

  async mounted(): Promise<void> {
    await this.refreshSurvey(this.surveyId);
  },

  methods: {
    ...mapActions(koordStore, ["refreshSurvey"]),
    ...mapState(koordStore, ["getMaxResponseDate", "getMinResponseDate"]),
  },
});
</script>
