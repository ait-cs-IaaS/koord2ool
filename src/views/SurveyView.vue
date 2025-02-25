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
        <time-slider v-if="submitDateMatch" />
        <v-row v-if="!submitDateMatch">
          <v-col>
            Responses have no responseDate set.
            <a href="https://help.limesurvey.org/portal/en/kb/articles/survey-activation" target="_blank">Info</a>
          </v-col>
        </v-row>
        <v-row v-if="hasResponses">
          <v-col> showing {{ responseCount }} answer(s) </v-col>
        </v-row>
        <v-row>
          <v-col cols="2"> Number of questions </v-col>
          <v-col cols="2">
            {{ questionCount }}
          </v-col>
        </v-row>
        <v-row v-if="survey?.startdate !== null">
          <v-col cols="2"> Start </v-col>
          <v-col cols="2">
            {{ survey?.startdate }}
          </v-col>
        </v-row>
        <v-row v-if="survey?.expires !== null">
          <v-col cols="2"> Expires </v-col>
          <v-col cols="2">
            {{ survey?.expires }}
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="hasResponses">
        <v-btn text="Refresh" @click="refreshSurvey(surveyId)" />
        <survey-component />
      </v-col>
      <v-alert v-else type="error"> No responses yet. </v-alert>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SurveyComponent from "../components/surveys/Survey.vue";
import TimeSlider from "../components/TimeSlider.vue";

import { defineComponent, onMounted, watch, computed } from "vue";
import { useSurveyStore } from "../store/surveyStore";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "SurveyView",

  components: {
    SurveyComponent,
    TimeSlider,
  },

  props: {
    surveyId: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const store = useSurveyStore();

    const { getResponses, getSurvey, submitDateMatch, responsesInTimeline, questionCount } = storeToRefs(store);

    const hasResponses = computed(() => responsesInTimeline.value.length > 0);

    const surveyActive = computed(() => {
      return typeof getSurvey.value !== "undefined" && getSurvey.value.active === "Y";
    });

    const responseCount = computed(() => {
      return `${responsesInTimeline.value.length} of ${getResponses.value.length}`;
    });

    console.debug(`Survey with ID: ${props.surveyId} is active: ${surveyActive.value}`);

    onMounted(async () => {
      await store.refreshSurvey(props.surveyId);
    });

    watch(
      () => props.surveyId,
      async (newVal: number) => {
        store.reset();
        await store.refreshSurvey(newVal);
      },
      { immediate: true },
    );

    return {
      responseCount,
      survey: getSurvey,
      submitDateMatch,
      questionCount,
      hasResponses,
      responsesInTimeline,
      refreshSurvey: store.refreshSurvey,
    };
  },
});
</script>
