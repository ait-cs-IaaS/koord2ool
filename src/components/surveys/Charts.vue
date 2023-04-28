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
  addCurrentStateForEachToken,
  addExpiredEntries,
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
  },
  setup(props) {
    const store = koordStore();

    const settings = computed(() => store.settings);
    const getExpireDate = computed(() => store.getExpireDate);
    const filteredResponses = computed(() => {
      const input = [
        {
          token: "f6HJjvqOl6qLPdT",
          time: new Date("2023-02-20T05:23:56.000Z"),
          value: "N/A",
        },
        {
          token: "jY5OGXppvqX2yAT",
          time: new Date("2023-02-20T06:35:51.000Z"),
          value: "Yes",
        },
        {
          token: "o7kHBZXzXElH8Df",
          time: new Date("2023-02-20T07:13:16.000Z"),
          value: "No",
        },
        {
          token: "jY5OGXppvqX2yAT",
          time: new Date("2023-02-21T09:13:33.000Z"),
          value: "No",
        },
        {
          token: "VxdmjYYVi8YPNP7",
          time: new Date("2023-02-21T09:14:59.000Z"),
          value: "Yes",
        },
        {
          token: "Ra72zk3nno95VMn",
          time: new Date("2023-02-21T09:33:18.000Z"),
          value: "No",
        },
        {
          token: "o7kHBZXzXElH8Df",
          time: new Date("2023-02-25T06:50:49.000Z"),
          value: "No",
        },
        {
          token: "Ra72zk3nno95VMn",
          time: new Date("2023-02-26T08:17:23.000Z"),
          value: "No",
        },
        {
          token: "W0OcwCqxlSHrXdF",
          time: new Date("2023-02-27T08:21:46.000Z"),
          value: "No",
        },
        {
          token: "VxdmjYYVi8YPNP7",
          time: new Date("2023-03-21T11:15:44.000Z"),
          value: "No",
        },
      ];
      const y = addExpiredEntries(input);
      const z = addCurrentStateForEachToken(y);
      return z;
    });

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

    onMounted(() => {
      console.log("filteredResponses", filteredResponses.value);
    });

    return {
      chartOptions,
      settings,
      getExpireDate,
      lastResponses,
      filteredResponses,
      questionText,
      countResponsesFor,
      createTimelineFor,
    };
  },
});
</script>
