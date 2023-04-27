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
          :counters="countResponsesFor(questionKey, lastResponses)"
          :chartjsdata="createTimelineFor(questionKey, responses)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ResponseModel } from "../../store/response.model";
import { ParticipantModel } from "../../store/participant.model";
import { QuestionModel, getQuestionText } from "../../store/question.model";
import ChartCard from "./ChartCard.vue";
import DisplayOptions from "./DisplayOptions.vue";
import {
  createTimelineFor,
  countResponsesFor,
} from "../../helpers/chartFunctions";
import { defineComponent, computed } from "vue";
import { koordStore } from "../../store";
import { chartOptions } from "./options";

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

    return {
      chartOptions,
      settings,
      getExpireDate,
      lastResponses,
      questionText,
      countResponsesFor,
      createTimelineFor,
    };
  },
});
</script>
