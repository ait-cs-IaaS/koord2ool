<template>
  <v-container fluid>
    <v-row>
      <display-options :display-options="showOptions" :options="chartOptions">
      </display-options>
    </v-row>
    <v-row class="pt-3">
      <v-col v-for="questionKey of questionKeys" :key="questionKey" cols="12">
        <chart-card
          :id="questionKey"
          :question="questionText(questionKey)"
          :counters="counters(questionKey, lastResponses)"
          :chartjsdata="chartjsdata(questionKey)"
          :question-type="questionType(questionKey)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ResponseModel } from "../../types/response.model";
import { ParticipantModel } from "../../types/participant.model";
import { QuestionModel } from "../../types/question.model";
import ChartCard from "./ChartCard.vue";
import DisplayOptions from "./DisplayOptions.vue";
import {
  createTimelineFor,
  countResponsesFor,
  filterResponses,
  getQuestionText,
  getQuestionType,
} from "../../helpers/chartFunctions";
import { defineComponent, computed } from "vue";
import { koordStore } from "../../store";
import { chartOptions } from "./options";
import { onMounted } from "vue";

export default defineComponent({
  name: "ChartsComponent",
  components: {
    DisplayOptions,
    ChartCard,
  },
  props: {
    questions: {
      type: Object as () => Record<string, QuestionModel>,
      default: () => ({} as Record<string, QuestionModel>),
    },
    responses: {
      type: Array<ResponseModel>,
      default: () => [],
    },
    participants: {
      type: Array<ParticipantModel>,
      default: () => [],
    },
    questionKeys: {
      type: Array<string>,
      default: () => [],
    },
    from: {
      type: Date,
      default: () => new Date(),
    },
    until: {
      type: Date,
      default: () => new Date(),
    },
    showOptions: {
      type: Boolean,
      default: false,
    },
    surveyId: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const store = koordStore();

    const settings = computed(() => store.settings);
    const getExpireDate = computed(() => store.getExpireDate);
    const lastResponses = computed(() => {
      const lastResponses: Record<string, ResponseModel> = {};

      props.responses.forEach((response) => {
        const token = response.token;
        if (
          !lastResponses[token] ||
          new Date(response.submitdate) >
            new Date(lastResponses[token].submitdate)
        ) {
          lastResponses[token] = response;
        }
      });

      return Object.values(lastResponses);
    });

    function questionText(questionKey: string): string {
      return getQuestionText(questionKey, props.questions);
    }

    function questionType(questionKey: string): string {
      return getQuestionType(questionKey, props.questions);
    }

    function counters(questionKey: string, lastResponses: ResponseModel[]) {
      return countResponsesFor(questionKey, lastResponses);
    }

    function chartjsdata(questionKey: string) {
      return createTimelineFor(questionKey, props.surveyId);
    }

    onMounted(() => {
      //console.log("filteredResponses", filteredResponses.value);
    });

    return {
      chartOptions,
      settings,
      getExpireDate,
      lastResponses,
      counters,
      chartjsdata,
      questionType,
      filterResponses,
      questionText,
      countResponsesFor,
      createTimelineFor,
    };
  },
});
</script>
