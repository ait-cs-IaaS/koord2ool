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

    <p v-if="hasResponses">{{ responses.length }} responses gathered.</p>
    <p v-else>No responses gathered yet.</p>

    <hr />

    <div v-if="hasResponses">
      <div
        v-for="responseSet in strippedResponses"
        :key="responseSet.key"
        class="question-group"
      >
        <h2>{{ responseSet.key }}</h2>

        <div class="flex flex-row">
          <div class="md:basis-1/3">
            <!-- Table -->
            <!-- TODO: extract as component -->
            <table class="w-full">
              <thead>
                <tr>
                  <th>Answer</th>
                  <th class="text-right">#</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="response in responseSet.responses"
                  :key="`${responseSet.key}/${
                    response.answer ?? `null-or-none`
                  }`"
                >
                  <td>{{ response.answer }}</td>
                  <td class="text-right">{{ response.count }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">{{ responseSet.responses.length }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="mkd:basis-2/3">
            <!-- Chart -->
            <!-- TODO -->
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ResponseModel, { strip } from "@/store/response.model";
import SurveyModel from "@/store/survey.model";
//import PieChartComponent from "@/components/pie-chart.vue";

interface QuestionGroup {
  key: string;

  responses: ResponseGroup[];
}

interface ResponseGroup {
  answer: string | null;

  count: number;
}

export default defineComponent({
  name: "SurveyView",
  components: {
    //PieChartComponent,
  },
  computed: {
    hasResponses(): boolean {
      return this.responses.length !== 0;
    },

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

    strippedResponses(): QuestionGroup[] {
      const grouped: QuestionGroup[] = [];
      this.responses
        .map((response) => strip(response))
        .forEach((response) => {
          Object.keys(response)
            .filter((key) => this.questionKeys.includes(key))
            .forEach((key) => {
              const answer = response[key] ? response[key] : null;
              const group = grouped.find((group) => group.key === key);
              if (typeof group === "undefined") {
                grouped.push({
                  key,
                  responses: [{ answer, count: 1 }],
                });
              } else {
                const answerSet = group.responses.find(
                  (response) => response.answer === answer
                );
                if (typeof answerSet === "undefined") {
                  group.responses.push({ answer, count: 1 });
                } else {
                  answerSet.count++;
                }
              }
            });
        });
      return grouped;
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
