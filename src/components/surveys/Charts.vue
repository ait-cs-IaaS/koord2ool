<template>
  <v-container fluid>
    <v-row>
      <display-options
        :displayOptions="showOptions"
        :options="timeOptions"
        @result="useLogicalTime = $event"
      />
    </v-row>
    <v-row class="pt-3">
      <v-col
        cols="12"
        lg="12"
        xl="6"
        v-for="questionKey of questionKeys"
        :key="questionKey"
      >
        <chart-card
          :id="questionKey"
          :question="questionText(questionKey)"
          :counters="countResponsesFor(questionKey)"
          :data="createTimelineFor(questionKey)"
          :useLogicalTime="useLogicalTime"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ResponseModel } from "@/store/response.model";
import ChartCard from "@/components/surveys/ChartCard.vue";
import { ParticipantModel } from "@/store/participant.model";
import { QuestionModel, getQuestionText } from "@/store/question.model";
import DisplayOptions from "@/components/surveys/DisplayOptions.vue";
import { ChartData, ChartDataset } from "chart.js";
import moment from "moment";
import { MinMax } from "@/helpers/min-max";
import { defineComponent } from "vue";

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
      useLogicalTime: false,
      timeOptions: [
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
    };
  },
  methods: {
    questionText(questionKey: string): string {
      return getQuestionText(questionKey, this.questions);
    },

    countResponsesFor(
      questionKey: string
    ): Array<{ name: string; value: number }> {
      const map = new Map<string, number>();
      this.responses
        .filter((response) => {
          const time = moment(response.submitdate);
          return (
            time.isSameOrBefore(this.until) &&
            (typeof response.$validUntil === "undefined" ||
              moment(response.$validUntil).isAfter(this.until))
          );
        })
        .forEach((response) => {
          const value = response[questionKey] || "N/A";
          map.set(value, (map.get(value) || 0) + 1);
        });
      const asAry: { name: string; value: number }[] = [];
      map.forEach((value, key) => asAry.push({ name: key, value }));

      asAry.sort((a, b) => {
        if (a.name.length === b.name.length) {
          if (a.name === b.name) return 0;
          return a.name > b.name ? -1 : 1;
        } else {
          return a.name.length - b.name.length;
        }
      });

      this.createTimelineFor(questionKey);

      return asAry;
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
          const x = this.useLogicalTime ? index : time.valueOf();
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
});
</script>
