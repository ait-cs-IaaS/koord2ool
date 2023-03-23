<template>
  <v-container fluid>
    <v-row>
      <display-options
        :displayOptions="showOptions"
        :options="options"
      >
      </display-options>
    </v-row>
    <v-row class="pt-3">
      <v-col cols="12" v-for="questionKey of questionKeys" :key="questionKey">
        <chart-card
          :id="questionKey"
          :question="questionText(questionKey)"
          :counters="countResponsesFor(questionKey)"
          :chartjsdata="createTimelineFor(questionKey)"
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
import { ChartData, ChartDataset } from "chart.js";
import { MinMax } from "../../helpers/min-max";
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { koordStore } from "../../store";
import { SettingsKey, Option } from "../../store/settings.model";

interface responseCount {
  name: string;
  value: number;
}

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
  computed: {
    ...mapState(koordStore, ["settings"]),
  },
  data() {
    return {
      options: {
        useLogicalTime: [
          {
            text: "Real",
            icon: "mdi-clock",
            value: false,
            description:
              "Actual time: time-based charts will use actual timestamps of survey responses.",
          },
          {
            text: "Logical",
            icon: "mdi-timer-sand-empty",
            value: true,
            description:
              "Logical time: time-based charts will show change in responses evenly for readability purposes.",
          },
        ],
        step: [
          {
            text: "1 hour",
            icon: "mdi-numeric-1",
            value: 1,
          },
          {
            text: "6 hours",
            icon: "mdi-numeric-6",
            value: 6,
          },
          {
            text: "24 hours",
            icon: "mdi-hours-24",
            value: 24,
          },
        ],
      } as Record<SettingsKey, Option[]>,
    };
  },
  methods: {
    questionText(questionKey: string): string {
      return getQuestionText(questionKey, this.questions);
    },

    countResponsesFor(questionKey: string): responseCount[] {
      const responseCounts: responseCount[] = [];
      const lastResponses: Record<string, ResponseModel> = {};

      this.responses.forEach((response) => {
        const token = response.token;
        if (!lastResponses[token] || new Date(response.submitdate) > new Date(lastResponses[token].submitdate)) {
          lastResponses[token] = response;
        }
      });

      Object.values(lastResponses).forEach((response) => {
        const value = response[questionKey] || "N/A";
        const existingIndex = responseCounts.findIndex((item) => item.name === value);

        if (existingIndex !== -1) {
          responseCounts[existingIndex].value++;
        } else {
          responseCounts.push({ name: value, value: 1 });
        }
      });

      responseCounts.sort((a, b) => {
        if (a.name.length === b.name.length) return 0;
        return a.name.length - b.name.length;
      });

      return responseCounts;
    },

    createTimelineFor(questionKey: string): ChartData<"line"> {
      const labels: (Date | number)[] = [];
      const timeline = new Map<string, { x: number; y: number }[]>();
      const lastChoice = new Map<string, string>();
      const timeRange = new MinMax();

      this.responses
        .filter(
          (r) => typeof r[questionKey] === "string" && r[questionKey] !== ""
        )
        .map((r) => ({
          token: r.token,
          time: new Date(r.submitdate),
          value: String(r[questionKey]),
        }))
        .sort((a, b) => a.time.valueOf() - b.time.valueOf())
        .forEach(({ token, time, value }, index) => {
          const x = this.settings.useLogicalTime ? index : time.valueOf();
          labels.push(x);
          timeRange.observe(x);

          const timelineForAnswer = timeline.get(value) || [];
          const newRecord = {
            x,
            y: timelineForAnswer.length
              ? timelineForAnswer[timelineForAnswer.length - 1].y + 1
              : 1,
          };
          timelineForAnswer.push(newRecord);
          timeline.set(value, timelineForAnswer);

          const oldAnswer = lastChoice.get(token);
          if (typeof oldAnswer !== "undefined") {
            const oldTimelineForAnswer = timeline.get(oldAnswer) || [];
            const newRecord = {
              x,
              y: oldTimelineForAnswer[oldTimelineForAnswer.length - 1].y - 1,
            };
            oldTimelineForAnswer.push(newRecord);
            timeline.set(oldAnswer, oldTimelineForAnswer);
          }
          lastChoice.set(token, value);
        });

      const { min, max } = timeRange;
      const datasets: ChartDataset<"line">[] = [];
      for (const [key, answerTimeline] of timeline.entries()) {
        if (!answerTimeline.length) continue;
        if (typeof min === "number" && answerTimeline[0].x > min) {
          answerTimeline.unshift({ x: min, y: 0 });
        }
        if (
          typeof max === "number" &&
          answerTimeline[answerTimeline.length - 1].x < max
        ) {
          answerTimeline.push({
            x: max,
            y: answerTimeline[answerTimeline.length - 1].y,
          });
        }

        const dataset = {
          data: answerTimeline,
          label: key,
          fill: true,
        };
        datasets.push(dataset);
      }

      return { labels, datasets };
    },
  },
  mounted() {
  },
});
</script>
