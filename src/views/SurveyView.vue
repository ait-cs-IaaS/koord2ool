<template>
  <main class="survey">
    <v-row
      class="survey-header"
      :class="{
        'survey-active': surveyActive,
        'survey-inactive': !surveyActive,
      }"
    >
      <v-col cols="12" md="12" class="pb-4">
        <h5>
          <v-badge
            pill
            small
            :variant="surveyActive ? 'success' : 'danger'"
            class="mr-2 text-white"
          >
            {{ surveyId }}
          </v-badge>
        </h5>
        <h1 class="survey-title" v-if="survey">
          {{ survey.surveyls_title }}
        </h1>
        <hr />
      </v-col>
    </v-row>
    <v-row class="d-print-none">
      <v-col cols="12">
        <v-card class="time-slider-container mb-5 shadow">
          <time-slider
            v-model="responseRange"
            :minDate="minResponseDate"
            :maxDate="maxResponseDate"
            v-if="hasResponseDates"
          />
          <v-simple-table>
            <template v-slot:default>
              <tbody>
                <tr v-if="!hasResponseDates">
                  <td colspan="2">
                    Responses have no responseDate set.
                    <a
                      href="https://help.limesurvey.org/portal/en/kb/articles/survey-activation"
                      target="_blank"
                      >Info</a
                    >
                  </td>
                </tr>
                <tr v-if="hasResponses">
                  <td colspan="2">
                    showing {{ responsesInTimeline.length }} of
                    {{ responses.length }} answer(s)
                  </td>
                </tr>
                <tr>
                  <td>Number of questions</td>
                  <td>{{ questionCount }}</td>
                </tr>
                <tr v-if="survey.startdate !== null">
                  <td>Start</td>
                  <td>{{ survey.startdate }}</td>
                </tr>
                <tr v-if="survey.expires !== null">
                  <td>Expires</td>
                  <td>{{ survey.expires }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <div class="d-flex justify-content-end">
            <v-btn
              type="primary"
              @click="refresh"
              :disabled="$store.state.syncing"
            >
              Refresh
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="survey-responses">
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
  </main>
</template>

<script lang="ts">
import SurveyModel from "@/store/survey.model";
import { QuestionModel } from "@/store/question.model";
import SurveyComponent from "@/components/surveys/Survey.vue";
import TimeSlider from "@/components/TimeSlider.vue";
import { ResponseModel } from "@/store/response.model";
import { ParticipantModel } from "@/store/participant.model";

import { defineComponent } from "vue";

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
    },

    minResponseDate(): Date {
      return this.$store.getters.getMinResponseDate();
    },

    maxResponseDate(): Date {
      return this.$store.getters.getMaxResponseDate();
    },

    hasResponseDates(): boolean {
      return this.$store.getters.hasSubmitDateMatch();
    },
  },
  data() {
    return {
      responseRange: [],
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
tbody td:first-child {
  width: 1%;
  white-space: nowrap;
}
</style>
