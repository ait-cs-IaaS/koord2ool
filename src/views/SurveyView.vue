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
        <time-slider v-if="hasSubmitDateMatch()" />
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
          :use-logical-time="!hasSubmitDateMatch()"
        />
        <div v-else>
          <v-btn @click="refreshSurvey(surveyId)">Refresh</v-btn>
          <v-alert type="error">No responses yet.</v-alert>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SurveyComponent from "../components/surveys/Survey.vue";
import TimeSlider from "../components/TimeSlider.vue";

import { defineComponent, ref, onMounted, watch } from "vue";
import { koordStore } from "../store";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "SurveyView",

  components: {
    SurveyComponent,
    TimeSlider,
  },

  setup() {
    const store = koordStore();

    const {
      getParticipants,
      getResponses,
      getSurvey,
      hasSubmitDateMatch,
      settings,
      fromDate,
      untilDate,
    } = storeToRefs(store);

    const route = useRoute();

    const surveyId = ref(Number(route.params.surveyId));

    const questionCount = ref(Object.keys(store.questions).length);

    const responses = ref(store.getResponses(surveyId.value));
    const participants = ref(store.getParticipants(surveyId.value));
    const survey = ref(store.getSurvey(surveyId.value));

    const hasResponses = ref(responses.value.length > 0);

    const surveyActive = ref(
      typeof survey.value !== "undefined" && survey.value.active === "Y",
    );

    const responsesInTimeline = ref(
      responses.value.filter((response) => {
        const thisTime = new Date(response.submitdate);
        return fromDate.value <= thisTime && thisTime <= untilDate.value;
      }),
    );

    console.debug(
      `Survey with ID: ${surveyId.value} is active: ${surveyActive.value}`,
    );

    onMounted(async () => {
      await store.refreshSurvey(surveyId.value);
    });

    watch(
      () => surveyId.value,
      async (newVal: number) => {
        await store.refreshSurvey(newVal);
      },
    );

    return {
      getParticipants,
      getResponses,
      getSurvey,
      hasSubmitDateMatch,
      settings,
      fromDate,
      untilDate,
      surveyId,
      questionCount,
      hasResponses,
      responses,
      participants,
      survey,
      responsesInTimeline,
      questions: survey.value.questions,
      refreshSurvey: store.refreshSurvey,
    };
  },
});
</script>
