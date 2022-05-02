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

    <b-card no-body v-if="responses.length">
      <b-tabs card>
        <b-tab title="Charts" active>
          <pie-chart
            :counters="[
              { name: 'A', value: 12 },
              { name: 'B', value: 3 },
            ]"
          />
        </b-tab>

        <b-tab title="Tabular">
          <tabular
            :show-keys="questionKeys"
            :responses="responses"
            sort-key="token"
          />
        </b-tab>
      </b-tabs>
    </b-card>
    <p v-else class="text-red-800">No responses yet.</p>
  </main>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import ResponseModel, { strip } from "@/store/response.model";
import SurveyModel from "@/store/survey.model";
import Tabular from "@/components/Tabular.vue";
import PieChart from "@/components/PieChart.vue";

@Component({
  components: {
    PieChart,
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
    console.debug(`beforeMount hook: ${this.surveyId} updated`);
  }
}
</script>
