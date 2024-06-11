import { ChartData, ChartDataset, FinancialDataPoint } from "chart.js";
import { chartColors } from "../components/surveys/colors";
import { koordStore } from "../store";
import {
  ResponseModel,
  responseCount,
  FilteredResponse,
} from "../types/response.model";
import { QuestionModel } from "../types/question.model";

export type ChartDataEntry = {
  name: string;
  data: [number, number][];
};

function getBorderColor(key: string): string {
  return chartColors[
    key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      chartColors.length
  ];
}

function filterNA(data: FilteredResponse[]): FilteredResponse[] {
  const store = koordStore();
  return data.filter(
    (item) => item.value !== "N/A" || store.settings.displayNA,
  );
}

function valuesFromResponses(data: FilteredResponse[]): Array<string> {
  const store = koordStore();

  const uniqueValues = new Set(data.map((item) => item.value));

  const filteredValues = Array.from(uniqueValues).filter(
    (value) => value !== "N/A",
  );

  if (uniqueValues.has("N/A") && store.settings.displayNA) {
    filteredValues.push("N/A");
  }

  return filteredValues;
}

export function countResponsesFor(
  questionKey: string,
  responses: ResponseModel[],
): responseCount[] {
  const responseCounts: responseCount[] = [];

  const filteredResponses = filterResponses(questionKey, responses);
  let lastResponses = getLastResponses(addExpiredEntries(filteredResponses));

  lastResponses = filterNA(lastResponses);

  lastResponses.forEach((response) => {
    const answer = response.value;

    const existingIndex = responseCounts.findIndex(
      (item) => item.name === answer,
    );

    if (existingIndex !== -1) {
      responseCounts[existingIndex].value++;
    } else {
      responseCounts.push({ name: answer, value: 1 });
    }
  });

  return responseCounts;
}

function responseMapper(
  questionKey: string,
  response: ResponseModel,
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
    relativeDate.getTime() +
      store.settings.expirationTime * 24 * 60 * 60 * 1000,
  );
}

export function addExpiredEntries(
  responses: FilteredResponse[],
): FilteredResponse[] {
  const store = koordStore();
  const currentDate = new Date();

  return responses.reduce(
    (acc, response) => {
      const expiredTime = expirationDate(response.time);

      const hasEntryWithinExpiration = acc.some(
        (existingResponse) =>
          existingResponse.token === response.token &&
          existingResponse.time >= response.time &&
          existingResponse.time <= expiredTime &&
          existingResponse !== response,
      );

      if (!hasEntryWithinExpiration && expiredTime <= currentDate) {
        if (expiredTime > store.untilDate) {
          return acc;
        }
        const expiredResponse: FilteredResponse = {
          token: response.token,
          time: expiredTime,
          value: "N/A",
        };

        acc.push(expiredResponse);
      }

      return acc;
    },
    [...responses],
  );
}

export function getLastResponses(
  responses: FilteredResponse[],
): FilteredResponse[] {
  const lastResponses: Record<string, FilteredResponse> = {};

  responses.forEach((response) => {
    const { token } = response;
    if (!lastResponses[token] || response.time > lastResponses[token].time) {
      lastResponses[token] = response;
    }
  });

  return Object.values(lastResponses);
}

export function filterResponses(
  questionKey: string,
  responses: ResponseModel[],
): FilteredResponse[] {
  return responses
    .map((response) => responseMapper(questionKey, response))
    .sort((a, b) => a.time.valueOf() - b.time.valueOf());
}

export function getQuestionText(
  questionKey: string,
  questions: Record<string, QuestionModel>,
): string {
  const key = questionKey.split("[");
  const question = questions[key[0]];
  if (question === undefined) {
    return "";
  }
  if (key.length === 1) {
    return question.question;
  }
  const subquestion = key[1].split("]")[0];
  if (
    question.subquestions !== undefined &&
    subquestion !== undefined &&
    question.subquestions[subquestion] !== undefined
  ) {
    return question.subquestions[subquestion];
  }
  return question.question;
}

export function parseDataForAreaChart(responses: FilteredResponse[]) {
  const uniqueValues = valuesFromResponses(responses);
  // Track the last response of each user

  // Initialize with "N/A" to account for users who have not responded yet
  const userLastResponse: { [token: string]: string } = responses
    .map((r) => ({
      [r.token]: "N/A",
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  // Determine the total number of unique users
  const totalUsers = new Set(responses.map((r) => r.token)).size;

  // Initialize counters for each response type
  const counters: Record<string, number> = uniqueValues.reduce(
    (acc, value) => {
      acc[value] = value === "N/A" ? totalUsers : 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Initialize chart data
  const chartData: ChartDataEntry[] = uniqueValues.map((value) => ({
    name: value,
    data: [],
  }));

  // Sort responses by time
  const sortedResponses = [...responses].sort(
    (a, b) => a.time.getTime() - b.time.getTime(),
  );

  sortedResponses.forEach((response) => {
    const time = response.time.getTime();

    // Decrease the count for user's last response
    if (userLastResponse[response.token]) {
      counters[userLastResponse[response.token]]--;
    }

    // Update the response counters
    counters[response.value]++;
    userLastResponse[response.token] = response.value;

    // Update chart data
    uniqueValues.forEach((value) => {
      const entry = chartData.find((entry) => entry.name === value);
      entry?.data.push([time, counters[value]]);
    });
  });

  return chartData;
}

export function transformChartData(
  chartData: ChartDataEntry[],
): ChartData<"line"> {
  const chartdataset = chartData.map((item) => ({
    cubicInterpolationMode: "monotone" as const,
    label: item.name,
    data: item.data.map(([x, y]) => ({ x, y })),
    fill: true,
    pointRadius: 1,
    backgroundColor: getBorderColor(item.name),
  }));
  return {
    datasets: chartdataset,
  };
}

export function parseDataForFreeTextChart(
  data: FilteredResponse[],
): ChartData<"line"> {
  const parsedData: Record<string, ChartDataset<"line">> = {};
  const store = koordStore();

  data.forEach((item) => {
    if (!parsedData[item.token]) {
      parsedData[item.token] = {
        label: item.token,
        data: [],
        fill: false,
        borderColor: getBorderColor(item.token),
      };
    }
    const point = {
      tooltip: item.value,
      x: item.time.getTime(),
      y: store.tokenMap[item.token] || 0,
    };
    parsedData[item.token].data.push(point);
  });

  return {
    datasets: Object.values(parsedData),
  };
}

export function doughnutChartData(
  responseCounts: responseCount[],
): ChartData<"doughnut"> {
  const labels: string[] = [];
  const datasets: ChartDataset<"doughnut">[] = [];
  const data: number[] = [];
  const backgroundColor: string[] = [];
  responseCounts.forEach(({ name, value }, index) => {
    labels.push(name);
    data.push(value);
    backgroundColor.push(chartColors[index % chartColors.length]);
  });
  datasets.push({
    data,
    backgroundColor,
  });

  return {
    labels,
    datasets,
  };
}

export function getParticipant(token: string): string {
  const store = koordStore();

  // participant where participant.token === token
  const participant = store.getParticipants.find(
    (participant) => participant.token === token,
  );
  return participant
    ? `${participant.participant_info.firstname} ${participant.participant_info.lastname}`
    : token;
}

export function aggregateResponses(
  data: FilteredResponse[],
): FilteredResponse[] {
  const store = koordStore();

  if (store.settings.timeFormat !== "stepped") {
    return data;
  }

  const aggregatedData: FilteredResponse[] = [];

  const { step } = store.settings;

  // if there are multiple responses from the same token withing step hours of time aggregate them
  data.forEach((item) => {
    const lastResponse = aggregatedData.find(
      (response) =>
        response.token === item.token &&
        response.time.getTime() + step * 60 * 60 * 1000 > item.time.getTime(),
    );

    if (lastResponse) {
      lastResponse.value = `${lastResponse.value}, ${item.value}`;
    } else {
      aggregatedData.push(item);
    }
  });

  return aggregatedData;
}

export function getOHCL(
  data: FilteredResponse[],
  questionKey: string,
): ChartData<"candlestick"> {
  const datasets: FinancialDataPoint[] = [];

  data.forEach((item) => {
    const point: FinancialDataPoint = {
      x: item.time.getTime(),
      o: Number(item.value),
      h: Number(item.value),
      l: Number(item.value),
      c: Number(item.value),
    };

    datasets.push(point);
  });

  return {
    datasets: [
      {
        label: questionKey,
        data: datasets,
      },
    ],
  };
}

export function createTimelineFor(
  questionKey: string,
): ChartData<"line"> | ChartData<"candlestick"> {
  const store = koordStore();
  if (store.selectedSurveyID === undefined) {
    console.error("No survey selected");
    return { datasets: [] };
  }

  const question_type = store.getQuestionType(questionKey);
  let filteredResponses = filterResponses(
    questionKey,
    store.responsesInTimeline,
  );

  filteredResponses = aggregateResponses(filteredResponses);

  store.updateTokenMap(store.selectedSurveyID);

  if (question_type === "numerical") {
    return getOHCL(filteredResponses, questionKey);
  }

  if (question_type === "yesno" || question_type === "list_dropdown") {
    const enrichedResponses = addExpiredEntries(filteredResponses);

    return transformChartData(parseDataForAreaChart(enrichedResponses));
  }

  return parseDataForFreeTextChart(filteredResponses);
}
