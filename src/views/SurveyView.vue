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
    <b-row class="d-print-none">
      <b-col cols="12">
        <b-card class="time-slider-container mb-5 shadow">
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
            <b-btn
              variant="primary"
              @click="refresh"
              :disabled="$store.state.syncing"
              >Refresh</b-btn
            >
          </div>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="survey-responses">
      <b-col>
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
        <b-alert v-else variant="danger">No responses yet.</b-alert>
      </b-col>
    </b-row>
  </main>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import SurveyModel from "@/store/survey.model";
import QuestionModel from "@/store/question.model";
import SurveyComponent from "@/components/surveys/Survey.vue";
import TimeSlider from "@/components/TimeSlider.vue";
import ResponseModel from "@/store/response.model";
import { ParticipantModel } from "@/store/participant.model";

@Component({
  components: {
    SurveyComponent,
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
    return this.$store.getters.getParticipants(this.surveyId);
  }

  get responses(): ResponseModel[] {
    return this.$store.getters.getResponses(this.surveyId);
  }

  get responsesInTimeline(): ResponseModel[] {
    return this.responses.filter((response) => {
      const thisTime = new Date(response.submitdate);
      return this.fromDate <= thisTime && thisTime <= this.untilDate;
    });
  }

  get submitDates(): string[] {
    return this.responses.map((response) => response.submitdate);
  }

  get survey(): SurveyModel {
    return this.$store.getters.getSurvey(this.surveyId);
  }

  get surveyActive(): boolean {
    return typeof this.survey !== "undefined" && this.survey.active === "Y";
  }

  get surveyId(): number {
    const { surveyId } = this.$route.params;
    return Number(surveyId);
  }

  get minResponseDate(): Date {
    return this.$store.getters.getMinResponseDate();
  }

  get maxResponseDate(): Date {
    return this.$store.getters.getMaxResponseDate();
  }

  get hasResponseDates(): boolean {
    return this.$store.getters.hasResponseDates();
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
    await this.$store.dispatch("refreshSurvey", this.surveyId);
  }

  mounted(): void {
    // This shouldn't happen, but it does :(
    if (typeof this.survey === "undefined") {
      throw new Error("Couldn't find a local copy of the survey.");
    }
  }

  @Watch("$route")
  async onRouteChange(): Promise<void> {
    await this.$store.dispatch("refreshSurvey", this.surveyId);
  }

  async refresh(): Promise<void> {
    await this.$store.dispatch("refreshSurvey", this.surveyId);
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
tbody td:first-child {
  width: 1%;
  white-space: nowrap;
}
</style>
