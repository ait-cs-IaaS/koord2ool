<template>
  <main
    class="survey"
    :class="{
      'survey-active': survey.active === 'Y',
      'survey-inactive': survey.active === 'N',
    }"
  >
    <h1>
      <span class="survey-id">#{{ surveyId }}</span>
      <span class="survey-title" v-if="survey">{{
        survey.surveyls_title
      }}</span>
    </h1>

    <hr class="my-2 lg:my-4" />

    <tabular v-if="responses.length" class="responses" :responses="responses">
    </tabular>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ResponseModel from "@/store/response.model";
import SurveyModel from "@/store/survey.model";
import Tabular from "@/components/tabular.vue";
//import PieChartComponent from "@/components/pie-chart.vue";

export default defineComponent({
  name: "SurveyView",
  components: {
    //PieChartComponent,
    Tabular,
  },
  computed: {
    questionKeys(): string[] {
      const seen = new Set<string>();
      this.responses.forEach((response) => {
        Object.keys(response)
          .filter((key) => /^Q\d+/i.test(key))
          .forEach((key) => seen.add(key));
      });
      return Array.from(seen);
    },

    responses(): ResponseModel[] {
      return this.$store.state.responses[this.surveyId] ?? [];
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

<style lang="scss">
.survey-id {
  @apply font-mono mr-2 px-1.5;
}

.survey-active .survey-id::before {
  @apply inline-block bg-green-800 w-3 h-3 rounded-full mr-1;
  content: " ";
}

.survey-inactive .survey-id::before {
  @apply inline-block ring-red-800 w-3 h-3 rounded-full mr-1;
  content: " ";
}
</style>
