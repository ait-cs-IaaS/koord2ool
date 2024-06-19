import { ChartData } from "chart.js";
import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";
import { getBorderColor } from "./shared-chartFunctions";

type ChartDataEntry = {
  name: string;
  data: [number, number][];
};

function valuesFromResponses(data: FilteredResponse[]): Array<string> {
  const store = useSurveyStore();

  const uniqueValues = new Set(data.map((item) => item.value));

  const filteredValues = Array.from(uniqueValues).filter((value) => value !== "N/A");

  if (uniqueValues.has("N/A") && store.settings.displayNA) {
    filteredValues.push("N/A");
  }

  return filteredValues;
}

export function parseDataForAreaChart(responses: FilteredResponse[]) {
  const store = useSurveyStore();

  const uniqueValues = valuesFromResponses(responses);
  const userLastResponse = initializeUserLastResponse(responses);
  const totalUsers = getTotalUsers(responses);
  const counters = initializeCounters(uniqueValues, totalUsers);
  const chartData = initializeChartData(uniqueValues);

  if (store.settings.timeFormat === "stepped") {
    return generateSteppedChartData(responses, uniqueValues, userLastResponse, counters, chartData);
  }

  return generateContinuousChartData(responses, uniqueValues, userLastResponse, counters, chartData);
}

function initializeUserLastResponse(responses: FilteredResponse[]): { [token: string]: string } {
  return responses.map((r) => ({ [r.token]: "N/A" })).reduce((acc, curr) => ({ ...acc, ...curr }), {});
}

function getTotalUsers(responses: FilteredResponse[]): number {
  return new Set(responses.map((r) => r.token)).size;
}

function initializeCounters(uniqueValues: string[], totalUsers: number): Record<string, number> {
  return uniqueValues.reduce(
    (acc, value) => {
      acc[value] = value === "N/A" ? totalUsers : 0;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function initializeChartData(uniqueValues: string[]): ChartDataEntry[] {
  return uniqueValues.map((value) => ({
    name: value,
    data: [],
  }));
}

function generateSteppedChartData(
  responses: FilteredResponse[],
  uniqueValues: string[],
  userLastResponse: { [token: string]: string },
  counters: Record<string, number>,
  chartData: ChartDataEntry[],
): ChartDataEntry[] {
  const store = useSurveyStore();
  const { step } = store.settings;
  const { fromDate, untilDate } = store;
  const currentTime = new Date(fromDate.getTime());

  while (currentTime <= untilDate) {
    const responsesInRange = responses.filter(
      (response) => response.time >= currentTime && response.time < new Date(currentTime.getTime() + step * 60 * 60 * 1000),
    );

    updateCountersForRange(responsesInRange, userLastResponse, counters);
    addCurrentCountersToChartData(currentTime, uniqueValues, counters, chartData);

    currentTime.setHours(currentTime.getHours() + step);
  }

  return chartData;
}

function generateContinuousChartData(
  responses: FilteredResponse[],
  uniqueValues: string[],
  userLastResponse: { [token: string]: string },
  counters: Record<string, number>,
  chartData: ChartDataEntry[],
): ChartDataEntry[] {
  responses.forEach((response) => {
    const time = response.time.getTime();

    if (userLastResponse[response.token]) {
      counters[userLastResponse[response.token]]--;
    }

    counters[response.value]++;
    userLastResponse[response.token] = response.value;

    uniqueValues.forEach((value) => {
      const entry = chartData.find((entry) => entry.name === value);
      entry?.data.push([time, counters[value]]);
    });
  });

  return chartData;
}

function updateCountersForRange(
  responsesInRange: FilteredResponse[],
  userLastResponse: { [token: string]: string },
  counters: Record<string, number>,
): void {
  responsesInRange.forEach((response) => {
    if (userLastResponse[response.token]) {
      counters[userLastResponse[response.token]]--;
    }

    counters[response.value]++;
    userLastResponse[response.token] = response.value;
  });
}

function addCurrentCountersToChartData(
  currentTime: Date,
  uniqueValues: string[],
  counters: Record<string, number>,
  chartData: ChartDataEntry[],
): void {
  uniqueValues.forEach((value) => {
    const entry = chartData.find((entry) => entry.name === value);
    entry?.data.push([currentTime.getTime(), counters[value]]);
  });
}

export function transformChartData(chartData: ChartDataEntry[]): ChartData<"line"> {
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
