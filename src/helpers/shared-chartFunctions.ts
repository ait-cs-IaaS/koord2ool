import { chartColors } from "./colors";
import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";

const keyToColorMap: Record<string, string> = {
  "N/A": "#D0D0D0",
  Yes: "#32CD32",
  No: "#FF0000",
};

export type ChartDataEntry = {
  name: string;
  data: [number, number][];
};

export function getBorderColor(key: string): string {
  if (!keyToColorMap[key]) {
    const index = Object.keys(keyToColorMap).length % chartColors.length;
    keyToColorMap[key] = chartColors[index];
  }
  return keyToColorMap[key];
}

function expirationDate(relativeDate: Date): Date {
  const store = useSurveyStore();
  return new Date(relativeDate.getTime() + store.settings.expirationTime * 24 * 60 * 60 * 1000);
}

export function addExpiredEntries(responses: FilteredResponse[]): FilteredResponse[] {
  const store = useSurveyStore();
  const currentDate = new Date();

  return responses.reduce(
    (acc, response) => {
      const expiredTime = expirationDate(response.time);

      if (expiredTime > store.untilDate || expiredTime > currentDate) {
        return acc;
      }

      const hasEntryWithinExpiration = acc.some(
        (existingResponse) =>
          existingResponse.token === response.token &&
          existingResponse.time >= response.time &&
          existingResponse.time <= expiredTime &&
          existingResponse !== response,
      );

      if (!hasEntryWithinExpiration) {
        const expiredResponse: FilteredResponse = {
          token: response.token,
          time: expiredTime,
          answer: "N/A",
        };

        acc.push(expiredResponse);
      }

      return acc;
    },
    [...responses],
  );
}

export function sortResponsesByTime(responses: FilteredResponse[]): FilteredResponse[] {
  return [...responses].sort((a, b) => a.time.getTime() - b.time.getTime());
}

export function initializeUserLastResponse(responses: FilteredResponse[]): { [token: string]: string } {
  return responses.map((r) => ({ [r.token]: "N/A" })).reduce((acc, curr) => ({ ...acc, ...curr }), {});
}

export function getTotalUsers(responses: FilteredResponse[]): number {
  return new Set(responses.map((r) => r.token)).size;
}

export function initializeChartData(uniqueValues: string[]): ChartDataEntry[] {
  return uniqueValues.map((value) => ({
    name: value,
    data: [],
  }));
}
