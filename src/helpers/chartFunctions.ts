import { ChartData, ChartDataset } from "chart.js";
import { chartColors } from "../components/surveys/colors";
import { koordStore } from "../store";
import {
  ResponseModel,
  responseCount,
  FilteredResponse,
} from "../types/response.model";

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

        const currentState: FilteredResponse = {
          token: token,
          time: response.time,
          value: previousEntry ? previousEntry.value : "N/A",
        };

        newResponses.push(currentState);
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

  return parseDataForLineChart(result);
}

export function parseDataForLineChart(
  data: FilteredResponse[]
): ChartData<"line"> {
  const values = new Set(data.map((item) => item.value));

  const parsedData: ChartDataset<"line">[] = [];

  values.forEach((value) => {
    const aggregatedData: Record<number, number> = data
      .filter((item) => item.value === value)
      .reduce((acc: Record<number, number>, item) => {
        const dateKey = item.time.getTime();
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey]++;
        return acc;
      }, {});

    const lineData = Object.entries(aggregatedData).map(([date, count]) => ({
      x: parseInt(date),
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

  console.debug(JSON.stringify(parsedData, null, 2));

  return {
    datasets: parsedData,
  };
}
