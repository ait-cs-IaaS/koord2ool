<template>
  <b-card no-body>
    <b-tabs card>
      <b-tab title="Charts" active>
        <b-container fluid>
          <b-row class="d-print-none mb-2">
            <b-col>
              <b-card
                title="Display options"
                header-bg-variant="primary"
                header-text-variant="light"
              >
                <b-form-group
                  label-cols-md="3"
                  label-cols-lg="2"
                  label-cols-xl="1"
                  label-class="font-weight-bold"
                  label="Time:"
                  :description="timeOptionDescription"
                  v-slot="{ ariaDescribedby }"
                >
                  <b-form-radio-group
                    id="time-display-setting"
                    name="time-display-setting"
                    v-model="useLogicalTime"
                    :options="timeOptions"
                    :aria-describedby="ariaDescribedby"
                  />
                </b-form-group>
              </b-card>
            </b-col>
          </b-row>
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
                <pie-chart :counters="countResponsesFor(question)" />

                <line-chart
                  :data="createTimelineFor(question)"
                  :is-logical-time="useLogicalTime"
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
import { ChartData, ChartDataset } from "chart.js";
import LineChart from "@/components/surveys/LineChart.vue";
import PieChart from "@/components/surveys/PieChart.vue";
import Tabular from "@/components/surveys/Tabular.vue";
import ResponseModel, { strip } from "@/store/response.model";
import QuestionModel from "@/store/question.model";
import SurveyModel from "@/store/survey.model";
import { MinMax } from "@/helpers/min-max";

@Component({
  components: {
    LineChart,
    PieChart,
    Tabular,
  },
})
export default class Survey extends Vue {
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
    const asAry: { name: string; value: number }[] = [];
    map.forEach((value, key) => asAry.push({ name: key, value }));

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
        time: new Date(r.TIME),
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
