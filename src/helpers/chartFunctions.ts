import { ChartData, ChartDataset } from "chart.js";
import { MinMax } from "./min-max";
import { chartColors } from "../components/surveys/colors";
import { koordStore } from "../store";
import { ResponseModel } from "../store/response.model";

export interface responseCount {
  name: string;
  value: number;
}

interface FilteredResponse {
  token: string;
  time: Date;
  value: string;
}

const store = koordStore();

function getBorderColor(key: string): string {
  return chartColors[
    key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      chartColors.length
  ];
}

export function countResponsesFor(
  questionKey: string,
  lastResponses: ResponseModel[]
): responseCount[] {
  const responseCounts: responseCount[] = [];
  lastResponses.forEach((response) => {
    const answer = getAnswer(questionKey, response);

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
}

function isResponseExpired(response: ResponseModel): boolean {
  return new Date(response.submitdate) <= store.getExpireDate;
}

function getAnswer(questionKey: string, response: ResponseModel): string {
  if (isResponseExpired(response)) {
    return "N/A";
  }
  return response[questionKey] || "N/A";
}

function responseMapper(
  questionKey: string,
  response: ResponseModel
): FilteredResponse {
  const answer = store.settings.expirationTimeline
    ? getAnswer(questionKey, response)
    : response[questionKey] || "N/A";

  return {
    token: response.token,
    time: new Date(response.submitdate),
    value: answer,
  };
}

function filterResponses(
  questionKey: string,
  responses: ResponseModel[]
): FilteredResponse[] {
  return responses
    .filter(
      (response) =>
        typeof response[questionKey] === "string" &&
        response[questionKey] !== ""
    )
    .map((response) => responseMapper(questionKey, response))
    .sort((a, b) => a.time.valueOf() - b.time.valueOf());
}

function processResponses(responses: FilteredResponse[]) {
  const labels: (Date | number)[] = [];
  const timeline = new Map<string, { x: number; y: number }[]>();
  const lastChoice = new Map<string, string>();
  const timeRange = new MinMax();

  responses.forEach(({ token, time, value }, index) => {
    const x = store.settings.useLogicalTime ? index : time.valueOf();
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

  return { labels, timeline, timeRange };
}

function createDatasets(
  timeline: Map<string, { x: number; y: number }[]>,
  timeRange: MinMax
): ChartDataset<"line">[] {
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
      borderColor: getBorderColor(key),
    };
    datasets.push(dataset);
  }

  return datasets;
}

export function createTimelineFor(
  questionKey: string,
  responses: ResponseModel[]
): ChartData<"line"> {
  const filteredResponses = filterResponses(questionKey, responses);
  const { labels, timeline, timeRange } = processResponses(filteredResponses);
  const datasets = createDatasets(timeline, timeRange);

  return { labels, datasets };
}
