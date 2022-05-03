<template>
  <b-card no-body>
    <b-tabs card>
      <b-tab title="Charts" active>
        <b-container fluid>
          <b-row>
            <b-col
              cols="12"
              md="6"
              lg="4"
              class="avoid-page-break"
              v-for="question of questionKeysOnly"
              :key="question"
            >
              <!-- actual chart -->
              <b-card
                :title="question"
                :sub-title="questions[question].question"
              >
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
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";
import PieChart from "@/components/surveys/PieChart.vue";
import Tabular from "@/components/surveys/Tabular.vue";
import ResponseModel, { strip } from "@/store/response.model";
import QuestionModel from "@/store/question.model";
import SurveyModel from "@/store/survey.model";

@Component({
  components: {
    PieChart,
    Tabular,
  },
})
export default class Survey extends Vue {
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

  @Prop({ type: Object, default: () => [] })
  questions!: Record<string, QuestionModel>;

  @Prop({ type: Array, default: () => [] })
  responses!: ResponseModel[];

  @Prop({ type: Object, required: true })
  survey!: SurveyModel;

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
}
</script>
