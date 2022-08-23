<template>
  <b-card no-body class="survey-results-outer-container">
    <b-tabs v-model="tabIndex" pills card>
      <template #tabs-end>
        <!-- Chart display options -->
        <b-button
          v-if="tabIndex === 0"
          class="ml-auto"
          variant="info"
          :pressed="chartDisplayOptions"
          @click="chartDisplayOptions = !chartDisplayOptions"
        >
          <b-icon icon="gear" aria-hidden="true" class="mr-2"></b-icon>
          Display options
          <b-icon
            icon="chevron-down"
            aria-hidden="true"
            class="ml-2 display-options-icon"
            :class="{ active: chartDisplayOptions }"
          ></b-icon>
        </b-button>

        <!-- Table display options -->
        <b-button
          v-if="tabIndex === 1"
          class="ml-auto"
          variant="info"
          :pressed="tableDisplayOptions"
          @click="tableDisplayOptions = !tableDisplayOptions"
        >
          <b-icon icon="gear" aria-hidden="true" class="mr-2"></b-icon>
          Display options
          <b-icon
            icon="chevron-down"
            aria-hidden="true"
            class="ml-2 display-options-icon"
            :class="{ active: tableDisplayOptions }"
          ></b-icon>
        </b-button>
      </template>
      <b-tab title="Charts">
        <template #title>
          <b-icon
            icon="clipboard-data"
            aria-hidden="true"
            class="mr-2"
          ></b-icon>
          <strong>Charts</strong>
        </template>

        <b-container fluid class="px-0 mx-0">
          <b-row class="d-print-none display-options-outer-container">
            <b-col class="px-0">
              <b-collapse v-model="chartDisplayOptions">
                <b-card class="mb-4 px-1 display-options-container shadow">
                  <b-form-checkbox
                    switch
                    size="lg"
                    v-model="useLogicalTime"
                    class="pointer"
                  >
                    <span class="display-option">
                      Show <b>logical</b> time <br />
                    </span>
                    <span class="display-option-description">
                      {{ timeOptionDescription }}
                    </span>
                  </b-form-checkbox>
                </b-card>
              </b-collapse>
            </b-col>
          </b-row>
          <b-row class="pt-3">
            <b-col
              cols="12"
              lg="12"
              xl="6"
              class="avoid-page-break px-1 py-1"
              v-for="questionKey of questionKeysOnly"
              :key="questionKey"
            >
              <chart-card
                :id="questionKey"
                :question="questions[questionKey].question"
                :counters="countResponsesFor(questionKey)"
                :data="createTimelineFor(questionKey)"
                :useLogicalTime="useLogicalTime"
              ></chart-card>
            </b-col>
          </b-row>
        </b-container>
      </b-tab>

      <b-tab title="Tabular" class="px-1">
        <template #title>
          <b-icon icon="table" aria-hidden="true" class="mr-2"></b-icon>
          <strong>Table</strong>
        </template>

        <b-container fluid class="px-3 mx-0">
          <b-row class="d-print-none display-options-outer-container">
            <b-col class="px-0">
              <b-collapse v-model="tableDisplayOptions">
                <b-card class="mb-4 px-1 display-options-container shadow">
                  <b-form-checkbox
                    switch
                    size="lg"
                    v-model="hideStale"
                    class="pointer"
                  >
                    <span class="display-option">
                      Hide <b>stale</b> <br />
                    </span>
                    <span class="display-option-description">
                      {{ staleOptionDescription }}
                    </span>
                  </b-form-checkbox>
                </b-card>
              </b-collapse>
            </b-col>
          </b-row>
          <b-row class="pt-3">
            <b-col cols="12" class="avoid-page-break px-1 py-1">
              <tabular
                :show-keys="questionKeys"
                :responses="responses"
                :participants="participants"
                :hideStale="hideStale"
                sort-key="submitdate"
              />
            </b-col>
          </b-row>
        </b-container>
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";
import { ChartData, ChartDataset } from "chart.js";
import moment from "moment";
import LineChart from "@/components/surveys/LineChart.vue";
import PieChart from "@/components/surveys/PieChart.vue";
import Tabular from "@/components/surveys/Tabular.vue";
import ChartCard from "@/components/surveys/ChartCard.vue";
import ResponseModel, { strip } from "@/store/response.model";
import QuestionModel from "@/store/question.model";
import SurveyModel from "@/store/survey.model";
import { MinMax } from "@/helpers/min-max";
import { ParticipantModel } from "@/store/participant.model";

@Component({
  components: {
    LineChart,
    PieChart,
    Tabular,
    ChartCard,
  },
})
export default class Survey extends Vue {
  chartDisplayOptions = false;
  tableDisplayOptions = false;
  tabIndex = 0;

  useLogicalTime = false;

  readonly timeOptions = [
    {
      text: "Real",
      value: false,
      description:
        "Actual time: time-based charts will use actual timestamps of survey responses.",
    },
    {
      text: "Logical",
      value: true,
      description:
        "Logical time: time-based charts will show change in responses evenly for readability purposes.",
    },
  ];

  get timeOptionDescription(): string {
    const value = this.timeOptions.find(
      (option) => option.value === this.useLogicalTime
    );
    return typeof value !== "undefined" ? value.description : "";
  }

  hideStale = false;

  readonly staleOptions = [
    {
      value: false,
      description: "Visible stale: decorate updated rows.",
    },
    {
      value: true,
      description: "Hidden stale: show all rows as default rows.",
    },
  ];

  get staleOptionDescription(): string {
    const value = this.staleOptions.find(
      (option) => option.value === this.hideStale
    );
    return typeof value !== "undefined" ? value.description : "";
  }

  get questionKeys(): string[] {
    return Array.from(
      new Set<string>(
        this.responses.map((response) => Object.keys(strip(response))).flat()
      )
    ).sort();
  }

  get questionKeysOnly(): string[] {
    return this.questionKeys.filter((key) => /^[qQ]\d+.*$/.test(key));
  }

  @Prop({ type: Object, default: () => [] })
  questions!: Record<string, QuestionModel>;

  @Prop({ type: Array, default: () => [] })
  responses!: ResponseModel[];

  @Prop({ type: Object, required: true })
  survey!: SurveyModel;

  @Prop({ type: Array, default: () => [] })
  participants!: ParticipantModel[];

  @Prop({ type: Date, default: () => new Date() })
  from!: Date;

  @Prop({ type: Date, default: () => new Date() })
  until!: Date;

  private countResponsesFor(questionKey: string) {
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
        let value = response[questionKey] || "N/A";
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
  }

  private createTimelineFor(questionKey: string): ChartData<"line"> {
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
  }
}
</script>
