<template>
  <main
    class="survey"
    :class="{
      'survey-active': survey.active === 'Y',
      'survey-inactive': survey.active === 'N',
    }"
  >
    <h1>
      <span class="survey-id">{{ surveyId }}</span>
      <span class="survey-title" v-if="survey">{{
        survey.surveyls_title
      }}</span>
    </h1>

    <p>{{ responses.length }} responses gathered.</p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ResponseModel, { strip } from "@/store/response.model";
import SurveyModel from "@/store/survey.model";
//import PieChartComponent from "@/components/pie-chart.vue";

export default defineComponent({
  name: "SurveyView",
  components: {
    //PieChartComponent,
  },
  computed: {
    responses(): ResponseModel[] {
      return this.$store.state.responses[this.surveyId] ?? [];
    },

    strippedResponses(): Record<string, string>[] {
      return this.responses.map((response) => strip(response));
    },

    survey(): SurveyModel | undefined {
      return this.$store.state.surveys[this.surveyId];
    },

    surveyId(): number {
      const { surveyId } = this.$route.params;
      if (typeof surveyId === "string") {
        return Number(surveyId);
      }
      throw new Error(`Invalid surveyId: ${surveyId}`);
    },
  },
  data() {
    return {};
  },
  methods: {},
});
</script>

<style>
.survey-id {
  @apply font-mono;
}

.survey-title {
  @apply ml-2;
}

.survey-active .survey-id {
  @apply text-green-800 px-1.5 bg-green-200 rounded-xl;
}

.survey-inactive .survey-id {
  @apply text-red-800 px-1.5 bg-red-200 rounded-xl;
}
</style>
