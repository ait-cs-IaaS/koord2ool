import { ChartData, FinancialDataPoint } from "chart.js";
import { FilteredResponse, HLResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";
import { getQuestionText } from "./chartFunctions";
import { initializeUserLastResponse, sortResponsesByTime, ChartDataEntry, initializeChartData } from "./shared-chartFunctions";

interface HistogramBin {
  value: number;
  count: number;
  label: string;
  percentage: string;
}

interface HistogramChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    label: string;
    barPercentage: number;
    categoryPercentage: number;
    originalData?: HistogramBin[];
  }>;
  title: string;
  subtitle: string;
}

function aggregateForHL(data: FilteredResponse[]): HLResponse[] {
  const aggregatedData: { [key: string]: HLResponse } = {};
  data.forEach((item) => {
    const dateKey = item.time.toISOString().split("T")[0];
    if (!aggregatedData[dateKey]) {
      aggregatedData[dateKey] = {
        token: item.token,
        time: new Date(dateKey),
        lowValue: Number(item.answer),
        highValue: Number(item.answer),
      };
    } else {
      const currentValue = Number(item.answer);
      aggregatedData[dateKey].lowValue = Math.min(Number(aggregatedData[dateKey].lowValue), currentValue);
      aggregatedData[dateKey].highValue = Math.max(Number(aggregatedData[dateKey].highValue), currentValue);
    }
  });
  return Object.values(aggregatedData);
}

export function setMinMaxFromDataset(filteredResponses: FilteredResponse[], questionKey: string) {
  const store = useSurveyStore();
  const minMax: { min: number; max: number } = { min: Infinity, max: -Infinity };

  filteredResponses.forEach((item) => {
    const value = Number(item.answer);
    if (!isNaN(value)) {
      if (value < minMax.min) {
        minMax.min = value;
      }
      if (value > minMax.max) {
        minMax.max = value;
      }
    }
  });

  if (minMax.min === Infinity) {
    minMax.min = 0;
  }
  if (minMax.max === -Infinity) {
    minMax.max = 100;
  }

  const padding = Math.max(1, (minMax.max - minMax.min) * 0.1);
  minMax.min -= padding;
  minMax.max += padding;

  store.setMinMax(minMax, questionKey);
}

export function getOHLC(data: FilteredResponse[], questionKey: string): ChartData<"candlestick"> {
  const hldata = aggregateForHL(data);
  const datasets: FinancialDataPoint[] = [];

  hldata.forEach((item) => {
    const point: FinancialDataPoint = {
      x: item.time.getTime(),
      o: +Number(item.lowValue).toFixed(),
      h: +Number(item.highValue).toFixed(),
      l: +Number(item.lowValue).toFixed(),
      c: +Number(item.highValue).toFixed(),
    };
    datasets.push(point);
  });

  return {
    datasets: [
      {
        label: getQuestionText(questionKey),
        data: datasets,
      },
    ],
  };
}

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

function bucketsFromResponses(data: FilteredResponse[], maxBins: number = 5): string[] {
  const values = data
    .map((item) => Number(item.answer))
    .filter((item) => !isNaN(item))
    .map((val) => Math.round(val));

  if (values.length === 0) {
    return [];
  }

  values.sort((a, b) => a - b);

  const min = values[0];
  const max = values[values.length - 1];

  if (min === max) {
    return [min.toString()];
  }

  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length <= maxBins) {
    return uniqueValues.sort((a, b) => a - b).map((val) => val.toString());
  }

  const binLabels = [];
  const itemsPerBin = Math.ceil(values.length / maxBins);

  for (let i = 0; i < maxBins; i++) {
    const startIdx = i * itemsPerBin;
    if (startIdx >= values.length) {
      break;
    }

    const endIdx = Math.min((i + 1) * itemsPerBin - 1, values.length - 1);
    const binStart = values[startIdx];
    const binEnd = values[endIdx];

    if (endIdx < startIdx) {
      continue;
    }
    if (binStart === binEnd) {
      binLabels.push(binStart.toString());
    } else {
      binLabels.push(`${binStart} - ${binEnd}`);
    }
  }

  if (binLabels.length === 0) {
    const binWidth = Math.ceil((max - min) / maxBins);

    for (let i = 0; i < maxBins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = i === maxBins - 1 ? max : min + (i + 1) * binWidth - 1;

      if (binStart > max) {
        break;
      }

      binLabels.push(`${binStart} - ${binEnd}`);
    }
  }

  return binLabels;
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

    getBucketsInRange(responsesInRange, uniqueBuckets, buckets);
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

function parseBinLabel(label: string): { min: number; max: number } | null {
  if (label.includes(" - ")) {
    const parts = label.split(" - ");
    if (parts.length === 2) {
      const min = parseInt(parts[0]);
      const max = parseInt(parts[1]);
      if (!isNaN(min) && !isNaN(max)) {
        return { min, max };
      }
    }
  } else {
    const value = parseInt(label);
    if (!isNaN(value)) {
      return { min: value, max: value };
    }
  }
  return null;
}

function getBucketsInRange(responsesInRange: FilteredResponse[], uniqueBuckets: string[], buckets: Record<string, number>): void {
  Object.keys(buckets).forEach((key) => {
    buckets[key] = 0;
  });

  responsesInRange.forEach((response) => {
    const value = Number(response.answer);
    if (isNaN(value)) {
      return;
    }

    const roundedValue = Math.round(value);

    let found = false;

    for (const bucket of uniqueBuckets) {
      const parsed = parseBinLabel(bucket);
      if (parsed && roundedValue >= parsed.min && roundedValue <= parsed.max) {
        buckets[bucket]++;
        found = true;
        break;
      }
    }

    if (!found && uniqueBuckets.length > 0) {
      let closestBucket = uniqueBuckets[0];
      let minDistance = Infinity;

      for (const bucket of uniqueBuckets) {
        const parsed = parseBinLabel(bucket);
        if (!parsed) {
          continue;
        }

        const bucketValue = parsed.min === parsed.max ? parsed.min : (parsed.min + parsed.max) / 2;

        const distance = Math.abs(roundedValue - bucketValue);
        if (distance < minDistance) {
          minDistance = distance;
          closestBucket = bucket;
        }
      }

      buckets[closestBucket]++;
    }
  });
}

function addBucketsToChartData(
  currentTime: Date,
  uniqueBuckets: string[],
  buckets: Record<string, number>,
  chartData: ChartDataEntry[],
): void {
  uniqueBuckets.forEach((bucket) => {
    const entry = chartData.find((entry) => entry.name === bucket);
    if (entry) {
      entry.data.push([currentTime.getTime(), buckets[bucket]]);
    }
  });
}

function generateContinuousChartData(
  responses: FilteredResponse[],
  uniqueBuckets: string[],
  userLastResponse: { [token: string]: string },
  buckets: Record<string, number>,
  chartData: ChartDataEntry[],
): ChartDataEntry[] {
  if (responses.length === 0) {
    return chartData;
  }

  let currentResponses: FilteredResponse[] = [];
  let lastTimestamp = new Date(0);

  responses.forEach((response) => {
    if (response.time.getTime() !== lastTimestamp.getTime() && currentResponses.length > 0) {
      getBucketsInRange(currentResponses, uniqueBuckets, buckets);
      addBucketsToChartData(lastTimestamp, uniqueBuckets, buckets, chartData);
      currentResponses = [];
    }

    currentResponses.push(response);
    lastTimestamp = response.time;
  });

  if (currentResponses.length > 0) {
    getBucketsInRange(currentResponses, uniqueBuckets, buckets);
    addBucketsToChartData(lastTimestamp, uniqueBuckets, buckets, chartData);
  }

  return chartData;
}

export function getHistogramData(data: FilteredResponse[], questionKey: string): HistogramChartData {
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
      subtitle: "",
    };
  }

  const values = valueData.map((item) => item.value);
  const uniqueTokens = new Set(valueData.map((item) => item.token)).size;

  const binLabels = bucketsFromResponses(data);

  const binCounts = binLabels.map((label, index) => {
    let count = 0;
    const roundedValues = values.map((val) => Math.round(val));
    const parsedBin = parseBinLabel(label);

    if (parsedBin) {
      const isLastBin = index === binLabels.length - 1;

      count = roundedValues.filter((val) => {
        if (parsedBin.min === parsedBin.max) {
          return val === parsedBin.min;
        }
        return isLastBin ? val >= parsedBin.min && val <= parsedBin.max : val >= parsedBin.min && val < parsedBin.max;
      }).length;
    }

    return {
      value: parsedBin ? parsedBin.min : 0,
      count: count,
      label: label,
      percentage: ((count / values.length) * 100).toFixed(1),
    };
  });

  const questionText = getQuestionText(questionKey);
  const shortTitle = questionText.length > 40 ? questionText.substring(0, 40) + "..." : questionText;

  return {
    labels: binCounts.map((item) => item.label),
    datasets: [
      {
        data: binCounts.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        label: `Responses (${values.length} total)`,
        barPercentage: 0.9,
        categoryPercentage: 0.8,
        originalData: binCounts,
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
  if (data.length === 0) {
    return [];
  }

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
    if (isNaN(value)) {
      return;
    }

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

  const timePoints = aggregatedPoints.map((point) => ({
    x: point.timestamp,
    y: Math.round(point.average),
    count: point.count,
    participants: point.uniqueParticipants,
    tooltip: `${new Date(point.timestamp).toLocaleString()}\nAverage: ${Math.round(point.average)}\nResponses: ${point.count}\nParticipants: ${point.uniqueParticipants}`,
  }));

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
