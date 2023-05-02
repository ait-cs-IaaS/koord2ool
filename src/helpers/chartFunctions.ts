import { ChartData, ChartDataset } from "chart.js";
import { chartColors } from "../components/surveys/colors";
import { koordStore } from "../store";
import {
  ResponseModel,
  responseCount,
  FilteredResponse,
} from "../types/response.model";
// import { MinMax } from "./min-max";

// function processResponses(responses: FilteredResponse[]) {
//   const labels: (Date | number)[] = [];
//   const timeline = new Map<string, { x: number; y: number }[]>();
//   const lastChoice = new Map<string, string>();
//   const timeRange = new MinMax();

//   responses.forEach(({ token, time, value }, index) => {
//     const x = store.settings.useLogicalTime ? index : time.valueOf();
//     labels.push(x);
//     timeRange.observe(x);

//     const timelineForAnswer = timeline.get(value) || [];
//     const newRecord = {
//       x,
//       y: timelineForAnswer.length
//         ? timelineForAnswer[timelineForAnswer.length - 1].y + 1
//         : 1,
//     };
//     timelineForAnswer.push(newRecord);
//     timeline.set(value, timelineForAnswer);

//     const oldAnswer = lastChoice.get(token);
//     if (typeof oldAnswer !== "undefined") {
//       const oldTimelineForAnswer = timeline.get(oldAnswer) || [];
//       const newRecord = {
//         x,
//         y: oldTimelineForAnswer[oldTimelineForAnswer.length - 1].y - 1,
//       };
//       oldTimelineForAnswer.push(newRecord);
//       timeline.set(oldAnswer, oldTimelineForAnswer);
//     }
//     lastChoice.set(token, value);
//   });

//   return { labels, timeline, timeRange };
// }

// function createDatasets(
//   timeline: Map<string, { x: number; y: number }[]>,
//   timeRange: MinMax
// ): ChartDataset<"line">[] {
//   const { min, max } = timeRange;
//   const datasets: ChartDataset<"line">[] = [];

//   for (const [key, answerTimeline] of timeline.entries()) {
//     if (!answerTimeline.length) continue;
//     if (typeof min === "number" && answerTimeline[0].x > min) {
//       answerTimeline.unshift({ x: min, y: 0 });
//     }
//     if (
//       typeof max === "number" &&
//       answerTimeline[answerTimeline.length - 1].x < max
//     ) {
//       answerTimeline.push({
//         x: max,
//         y: answerTimeline[answerTimeline.length - 1].y,
//       });
//     }

//     const dataset = {
//       data: answerTimeline,
//       label: key,
//       fill: false,
//       borderColor: getBorderColor(key),
//     };
//     datasets.push(dataset);
//   }

//   return datasets;
// }

// function getExpireDate(submittime: number | null): Date {
//   if (submittime) {
//     return new Date(
//       submittime - store.settings.expirationTime * 24 * 60 * 60 * 1000
//     );
//   }
//   return store.getExpireDate;
// }

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

function isResponseExpired(response: ResponseModel, expireDate: Date): boolean {
  return new Date(response.submitdate) <= expireDate;
}

function getAnswer(questionKey: string, response: ResponseModel): string {
  const store = koordStore();
  if (isResponseExpired(response, store.getExpireDate)) {
    return "N/A";
  }
  return response[questionKey] || "N/A";
}

function responseMapper(
  questionKey: string,
  response: ResponseModel
): FilteredResponse {
  return {
    token: response.token,
    time: new Date(response.submitdate),
    value: response[questionKey] || "N/A",
  };
}

function expirationDate(relativeDate: Date): Date {
  const store = koordStore();
  return new Date(
    relativeDate.getTime() + store.settings.expirationTime * 24 * 60 * 60 * 1000
  );
}

export function addExpiredEntries(
  responses: FilteredResponse[]
): FilteredResponse[] {
  const newResponses: FilteredResponse[] = [...responses];
  const currentDate = new Date();

  responses.forEach((response) => {
    const expiredTime = expirationDate(response.time);

    const hasEntryWithinExpiration = newResponses.some((existingResponse) => {
      return (
        existingResponse.token === response.token &&
        existingResponse.time >= response.time &&
        existingResponse.time <= expiredTime &&
        existingResponse !== response
      );
    });

    if (!hasEntryWithinExpiration && expiredTime <= currentDate) {
      const expiredResponse: FilteredResponse = {
        token: response.token,
        time: expiredTime,
        value: "N/A",
      };

      newResponses.push(expiredResponse);
    }
  });

  return newResponses;
}

export function filterResponses(
  questionKey: string,
  responses: ResponseModel[]
): FilteredResponse[] {
  return responses
    .map((response) => responseMapper(questionKey, response))
    .sort((a, b) => a.time.valueOf() - b.time.valueOf());
}

function getAllTokens(responses: FilteredResponse[]): string[] {
  const tokens: string[] = [];

  responses.forEach((response) => {
    if (!tokens.includes(response.token)) {
      tokens.push(response.token);
    }
  });

  return tokens;
}

export function addCurrentStateForEachToken(
  responses: FilteredResponse[]
): FilteredResponse[] {
  const newResponses: FilteredResponse[] = [...responses];
  const tokens = getAllTokens(newResponses);

  responses.forEach((response) => {
    tokens.forEach((token) => {
      if (token !== response.token) {
        const previousEntry = newResponses
          .filter(
            (entry) => entry.token === token && entry.time <= response.time
          )
          .sort((a, b) => b.time.getTime() - a.time.getTime())[0];

        if (previousEntry) {
          const currentState: FilteredResponse = {
            token: token,
            time: response.time,
            value: previousEntry.value,
          };

          newResponses.push(currentState);
        }
      }
    });
  });

  return newResponses.sort((a, b) => a.time.getTime() - b.time.getTime());
}

export function createTimelineFor(
  questionKey: string,
  responses: ResponseModel[]
): ChartData<"line"> {
  const filteredResponses = filterResponses(questionKey, responses);
  const enrichedResponses = addExpiredEntries(filteredResponses);
  const result = addCurrentStateForEachToken(enrichedResponses);

  // const { labels, timeline, timeRange } = processResponses(filteredResponses);
  // console.debug("createTimelineFor", labels, timeline, timeRange);
  //const datasets = createDatasets(timeline, timeRange);
  // return { labels, datasets };
  return parseDataForLineChart(result);
}

export function parseDataForLineChart(
  data: FilteredResponse[]
): ChartData<"line"> {
  const values = new Set(data.map((item) => item.value));

  const parsedData: ChartDataset<"line">[] = [];

  values.forEach((value) => {
    const aggregatedData = data
      .filter((item) => item.value === value)
      .reduce((acc: Record<string, number>, item) => {
        const dateKey = new Date(item.time).toLocaleDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey]++;
        return acc;
      }, {});

    const lineData = Object.entries(aggregatedData).map(([date, count]) => ({
      x: new Date(date).getTime(),
      y: count,
    }));

    if (lineData.length > 0) {
      parsedData.push({
        label: value,
        data: lineData,
        fill: false,
        borderColor: getBorderColor(value),
      });
    }
  });

  return {
    datasets: parsedData,
  };
}
