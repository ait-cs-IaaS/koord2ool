<template>
  <main class="survey">
    <b-row
      class="survey-header"
      :class="{
        'survey-active': survey.active === 'Y',
        'survey-inactive': survey.active === 'N',
      }"
    >
      <b-col cols="12" md="6">
        <h2>
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
        </h2>
      </b-col>
      <b-col cols="12" md="6"> Time slider goes here </b-col>
    </b-row>
    <b-row class="survey-details">
      <b-col>
        <b-card no-body v-if="responses.length">
          <b-tabs card>
            <b-tab title="Charts" active>
              <b-container fluid>
                <b-row>
                  <b-col
                    cols="12"
                    md="6"
                    lg="4"
                    v-for="question of questionKeysOnly"
                    :key="question"
                  >
                    <b-card :title="question">
                      <pie-chart
                        class="pie-chart"
                        :counters="countResponsesFor(question)"
                      />
                    </b-card>
                  </b-col>
                </b-row>
              </b-container>
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
      </b-col>
    </b-row>
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

  get questionKeysOnly(): string[] {
    return this.questionKeys.filter((key) => key !== "TIME" && key !== "token");
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

  private countResponsesFor(questionKey: string) {
    const map = new Map<string, number>();
    this.responses.forEach((response) => {
      const value = response[questionKey] || "N/A";
      map.set(value, (map.get(value) || 0) + 1);
    });
    const asAry: any[] = [];
    map.forEach((value, key) => asAry.push({ name: key, value }));
    return asAry;
  }

  async beforeMount(): Promise<void> {
    await this.$store.dispatch("refreshResponses", this.surveyId);
    console.debug(`beforeMount hook: ${this.surveyId} updated`);
  }
}
</script>

<style>
@media print {
  .pie-chart {
    max-height: 16rem;
    max-width: 16rem;
  }
}
</style>
