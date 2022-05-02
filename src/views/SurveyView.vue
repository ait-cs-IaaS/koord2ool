<template>
  <main class="survey">
    <h1>
      <b-badge
        pill
        :variant="survey.active === 'Y' ? 'success' : 'danger'"
        class="mr-2"
      >
        {{ surveyId }}
      </b-badge>
      <span class="survey-title" v-if="survey">{{
        survey.surveyls_title
      }}</span>
      <small v-if="survey.active === 'Y'" class="text-muted"> (active) </small>
      <small v-else class="text-muted">(inactive)</small>
    </h1>

    <hr class="my-2 lg:my-4" />

    <tabular
      v-if="responses.length"
      class="responses"
      :responses="responses"
      :show-keys="questionKeys"
      sort-key="token"
    />
    <p v-else class="text-red-800">No responses yet.</p>
  </main>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import ResponseModel, { strip } from "@/store/response.model";
import SurveyModel from "@/store/survey.model";
import Tabular from "@/components/Tabular.vue";
//import PieChartComponent from "@/components/pie-chart.vue";

@Component({
  components: {
    Tabular,
  },
})
export default class SurveyView extends Vue {
  get questionKeys(): string[] {
    return Array.from(
      new Set<string>(
        this.responses.map((response) => Object.keys(strip(response))).flat()
      )
    ).sort();
  }

  get responses(): ResponseModel[] {
    return this.$store.state.responses[this.surveyId] || [];
  }

  get survey(): SurveyModel | undefined {
    return this.$store.state.surveys[this.surveyId];
  }

  get surveyId(): number {
    const { surveyId } = this.$route.params;
    return Number(surveyId);
  }

  async beforeMount(): Promise<void> {
    await this.$store.dispatch("refreshResponses", this.surveyId);
    console.debug(`${this.surveyId} updated`);
  }
}
</script>
