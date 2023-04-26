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
import { chartOptions } from "./options";
import { chartColors } from "./colors";

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
  data() {
    return {
      chartOptions,
    };
  },
  computed: {
    ...mapState(koordStore, ["settings", "getExpireDate"]),
    lastResponses(): ResponseModel[] {
      const lastResponses: Record<string, ResponseModel> = {};

      this.responses.forEach((response) => {
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
    },
  },
  methods: {
    questionText(questionKey: string): string {
      return getQuestionText(questionKey, this.questions);
    },

    countResponsesFor(questionKey: string): responseCount[] {
      const responseCounts: responseCount[] = [];
      this.lastResponses.forEach((response) => {
        let answer = response[questionKey] || "N/A";
        if (new Date(response.submitdate) <= this.getExpireDate) {
          answer = "N/A";
        }
        const existingIndex = responseCounts.findIndex(
          (item) => item.name === answer
        );

        if (existingIndex !== -1) {
          responseCounts[existingIndex].value++;
        } else {
          responseCounts.push({ name: answer, value: 1 });
        }
      });

      responseCounts.sort((a, b) => {
        if (a.name.length === b.name.length) return 0;
        return a.name.length - b.name.length;
      });

      return responseCounts;
    },

    getBorderColor(key: string): string {
      return chartColors[
        key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
          chartColors.length
      ];
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
          fill: false,
          borderColor: this.getBorderColor(key),
        };
        datasets.push(dataset);
      }

      return { labels, datasets };
    },
  },
});
</script>
