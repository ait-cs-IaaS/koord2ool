import { ChartData } from "chart.js";
import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";
import { getQuestionText } from "./chartFunctions";
import { initializeUserLastResponse, sortResponsesByTime, ChartDataEntry, initializeChartData } from "./shared-chartFunctions";

export function getNumericalAreaChartData(responses: FilteredResponse[]): ChartDataEntry[] {
  const store = useSurveyStore();

  const uniqueBuckets = bucketsFromResponses(responses);
  const userLastResponse = initializeUserLastResponse(responses);
  const buckets = initializeBuckets(uniqueBuckets);
  const chartData = initializeChartData(uniqueBuckets);
  const sortedResponses = sortResponsesByTime(responses);

  if (store.settings.timeFormat === "stepped") {
    return generateSteppedChartData(sortedResponses, uniqueBuckets, userLastResponse, buckets, chartData);
  }

  return generateContinuousChartData(sortedResponses, uniqueBuckets, userLastResponse, buckets, chartData);
}

function bucketsFromResponses(data: FilteredResponse[], max_buckets: number = 5): string[] {
  // assume that the answer is a number and create max_buckets equal size buckets based on the range of the answers

  const values = data.map((item) => Number(item.answer)).filter((item) => !isNaN(item));
  if (values.length === 0) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return Array(max_buckets).fill(`${min}`);
  }

  const totalCount = max - min + 1;
  const bucketSize = Math.ceil(totalCount / max_buckets);

  const buckets: string[] = [];

  for (let i = 0; i < max_buckets; i++) {
    const bucketMin = min + i * bucketSize;
    let bucketMax = i === 4 ? max : bucketMin + bucketSize - 1;
    bucketMax = Math.min(bucketMax, max);
    buckets.push(`${bucketMin} - ${bucketMax}`);
  }

  return buckets;
}

function generateSteppedChartData(
  responses: FilteredResponse[],
  uniqueBuckets: string[],
  userLastResponse: { [token: string]: string },
  buckets: Record<string, number>,
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

    getBucketsinRange(responsesInRange, userLastResponse, buckets);
    addBucketsToChartData(currentTime, uniqueBuckets, buckets, chartData);

    currentTime.setHours(currentTime.getHours() + step);
  }

  return chartData;
}

function initializeBuckets(uniqueBuckets: string[]): Record<string, number> {
  const buckets: Record<string, number> = {};
  uniqueBuckets.forEach((bucket) => {
    buckets[bucket] = 0;
  });

  return buckets;
}

function getBucketsinRange(
  responsesInRange: FilteredResponse[],
  userLastResponse: { [token: string]: string },
  buckets: Record<string, number>,
) {
  responsesInRange.forEach((response) => {
    const answer = Number(response.answer);
    if (isNaN(answer)) {
      return;
    }

    const bucket = getBucket(answer, userLastResponse[response.token]);
    buckets[bucket]++;
  });
}

function getBucket(answer: number, lastResponse: string): string {
  const bucket = lastResponse ? lastResponse : answer.toString();
  return bucket;
}

function addBucketsToChartData(currentTime: Date, uniqueBuckets: string[], buckets: Record<string, number>, chartData: ChartDataEntry[]) {
  return uniqueBuckets.forEach((bucket) => {
    const entry = chartData.find((entry) => entry.name === bucket);
    entry?.data.push([currentTime.getTime(), buckets[bucket]]);
  });
}

function generateContinuousChartData(
  responses: FilteredResponse[],
  uniqueBuckets: string[],
  userLastResponse: { [token: string]: string },
  buckets: Record<string, number>,
  chartData: ChartDataEntry[],
): ChartDataEntry[] {
  // TODO: IMPLEMENT

  const currentTime = new Date(responses[0].time.getTime());

  getBucketsinRange(responses, userLastResponse, buckets);
  addBucketsToChartData(currentTime, uniqueBuckets, buckets, chartData);

  return chartData;
}

export function getHistogramData(data: FilteredResponse[], questionKey: string) {
  const valueData = data
    .map((item) => ({
      value: Number(item.answer),
      timestamp: item.time,
      token: item.token,
    }))
    .filter((item) => !isNaN(item.value));

  if (valueData.length === 0) {
    return {
      labels: [],
      datasets: [],
      title: "No numerical data available",
    };
  }

  const values = valueData.map((item) => item.value);

  const uniqueTokens = new Set(valueData.map((item) => item.token)).size;
  const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
  const valueCounts = uniqueValues.map((value) => {
    const count = values.filter((v) => v === value).length;
    return {
      value: value,
      count: count,
      label: value.toString(),
      percentage: ((count / values.length) * 100).toFixed(1),
    };
  });

  const questionText = getQuestionText(questionKey);
  const shortTitle = questionText.length > 40 ? questionText.substring(0, 40) + "..." : questionText;
  return {
    labels: valueCounts.map((item) => item.label),
    datasets: [
      {
        data: valueCounts.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        label: `Responses (${values.length} total)`,
        barPercentage: 0.9,
        categoryPercentage: 0.8,
        originalData: valueCounts,
      },
    ],
    title: shortTitle,
    subtitle: `${uniqueTokens} participants, ${values.length} responses`,
  };
}

function aggregateDataByTimeStep(
  data: FilteredResponse[],
  stepHours: number,
): Array<{
  timestamp: number;
  average: number;
  count: number;
  uniqueParticipants: number;
}> {
  if (data.length === 0) return [];

  const sortedData = [...data].sort((a, b) => a.time.getTime() - b.time.getTime());
  const stepMilliseconds = stepHours * 60 * 60 * 1000;
  const timeGroups: Record<
    string,
    {
      timestamp: number;
      values: number[];
      tokens: string[];
    }
  > = {};

  sortedData.forEach((response) => {
    const value = Number(response.answer);
    if (isNaN(value)) return;

    const timestamp = response.time.getTime();
    const roundedTimestamp = Math.floor(timestamp / stepMilliseconds) * stepMilliseconds;
    const timeKey = roundedTimestamp.toString();

    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = {
        timestamp: roundedTimestamp,
        values: [],
        tokens: [],
      };
    }

    timeGroups[timeKey].values.push(value);
    timeGroups[timeKey].tokens.push(response.token);
  });

  return Object.values(timeGroups)
    .map((group) => {
      const values = group.values;
      return {
        timestamp: group.timestamp,
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        count: values.length,
        uniqueParticipants: new Set(group.tokens).size,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function getAverageLineChart(data: FilteredResponse[], questionKey?: string): ChartData<"line"> {
  const store = useSurveyStore();
  const stepHours = store.settings.step || 24;

  const aggregatedPoints = aggregateDataByTimeStep(data, stepHours);

  if (aggregatedPoints.length === 0) {
    return {
      datasets: [],
    };
  }

  // Format data for hover tooltips
  const timePoints = aggregatedPoints.map((point) => ({
    x: point.timestamp,
    y: Number(point.average.toFixed(2)),
    count: point.count,
    participants: point.uniqueParticipants,
    tooltip: `${new Date(point.timestamp).toLocaleString()}\nAverage: ${point.average.toFixed(2)}\nResponses: ${point.count}\nParticipants: ${point.uniqueParticipants}`,
  }));

  // const totalParticipants = new Set(data.map((item) => item.token)).size;
  const labelText = questionKey ? `${getQuestionText(questionKey)} (${stepHours}h intervals)` : `Average (${stepHours}h intervals)`;

  return {
    datasets: [
      {
        data: timePoints,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        label: labelText,
      },
    ],
  };
}
