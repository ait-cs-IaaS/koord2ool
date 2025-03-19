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

interface ExtendedFinancialDataPoint extends FinancialDataPoint {
  m: number;
}
interface ExtendedHLResponse extends HLResponse {
  values: number[];
}

function aggregateForHL(data: FilteredResponse[]): ExtendedHLResponse[] {
  const aggregatedData: { [key: string]: ExtendedHLResponse } = {};

  data.forEach((item) => {
    const dateKey = item.time.toISOString().split("T")[0];
    const value = Number(item.answer);

    if (isNaN(value)) return;

    if (!aggregatedData[dateKey]) {
      aggregatedData[dateKey] = {
        token: item.token,
        time: new Date(dateKey),
        lowValue: value,
        highValue: value,
        values: [value],
      };
    } else {
      aggregatedData[dateKey].lowValue = Math.min(aggregatedData[dateKey].lowValue, value);
      aggregatedData[dateKey].highValue = Math.max(aggregatedData[dateKey].highValue, value);
      aggregatedData[dateKey].values.push(value);
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

interface ExtendedFinancialDataPoint extends FinancialDataPoint {
  m: number;
}

export function getOHLC(data: FilteredResponse[], questionKey: string): ChartData<"candlestick"> {
  const hldata = aggregateForHL(data);
  const datasets: ExtendedFinancialDataPoint[] = [];

  hldata.forEach((item) => {
    const values = [...item.values].sort((a, b) => a - b);
    let median: number;
    const mid = Math.floor(values.length / 2);

    if (values.length === 0) {
      median = (item.highValue + item.lowValue) / 2;
    } else if (values.length % 2 === 0) {
      median = (values[mid - 1] + values[mid]) / 2;
    } else {
      median = values[mid];
    }

    const open = item.values[0];
    const close = item.values[item.values.length - 1];

    const point: ExtendedFinancialDataPoint = {
      x: item.time.getTime(),
      o: +Number(open).toFixed(),
      h: +Number(item.highValue).toFixed(),
      l: +Number(item.lowValue).toFixed(),
      c: +Number(close).toFixed(),
      m: +Number(median).toFixed(),
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

    for (let i = 0; i < uniqueBuckets.length; i++) {
      const bucket = uniqueBuckets[i];
      const parsed = parseBinLabel(bucket);

      if (!parsed) continue;
      if (parsed.min === parsed.max) {
        if (roundedValue === parsed.min) {
          buckets[bucket]++;
          found = true;
          break;
        }
      } else {
        if (i === uniqueBuckets.length - 1) {
          if (roundedValue >= parsed.min && roundedValue <= parsed.max) {
            buckets[bucket]++;
            found = true;
            break;
          }
        } else {
          const nextBucket = parseBinLabel(uniqueBuckets[i + 1]);
          if (nextBucket && roundedValue >= parsed.min && roundedValue < nextBucket.min) {
            buckets[bucket]++;
            found = true;
            break;
          }
        }
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

  const bins = createOptimalBins(values);

  const binCounts = countValuesInBins(values, bins);

  const binData = bins.map((bin, index) => ({
    value: bin.min,
    count: binCounts[index],
    label: bin.label,
    percentage: ((binCounts[index] / values.length) * 100).toFixed(1),
  }));

  const questionText = getQuestionText(questionKey);
  const shortTitle = questionText.length > 40 ? questionText.substring(0, 40) + "..." : questionText;

  return {
    labels: binData.map((item) => item.label),
    datasets: [
      {
        data: binData.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        label: `Responses (${values.length} total)`,
        barPercentage: 0.95,
        categoryPercentage: 0.95,
        originalData: binData,
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
function calculateFDRule(values: number[]): number {
  const sortedValues = [...values].sort((a, b) => a - b);

  const q1Index = Math.floor(sortedValues.length * 0.25);
  const q3Index = Math.floor(sortedValues.length * 0.75);
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  const iqr = q3 - q1 || 1;
  // Apply Freedman-Diaconis rule
  const binWidth = 2 * iqr * Math.pow(values.length, -1 / 3);

  return Math.max(1, binWidth);
}

function countValuesInBins(values: number[], bins: { min: number; max: number }[]): number[] {
  const counts = Array(bins.length).fill(0);

  values.forEach((value) => {
    for (let i = 0; i < bins.length; i++) {
      const { min, max } = bins[i];
      if (i === bins.length - 1) {
        if (value >= min && value <= max) {
          counts[i]++;
          break;
        }
      } else if (value >= min && value < max) {
        counts[i]++;
        break;
      }
    }
  });

  return counts;
}

function createOptimalBins(values: number[], maxBins = 10): { min: number; max: number; label: string }[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ min, max, label: `${min.toFixed(2)} - ${max.toFixed(2)}` }];
  }

  let binWidth = calculateFDRule(values);

  if (values.length < 10) {
    binWidth = Math.max(1, Math.ceil((max - min) / 5));
  }
  let numBins = Math.ceil((max - min) / binWidth);
  if (numBins > maxBins) {
    numBins = maxBins;
    binWidth = (max - min) / numBins;
  }

  if (numBins < 2 && max - min > 1) {
    numBins = Math.min(maxBins, Math.max(2, Math.ceil(values.length / 2)));
    binWidth = (max - min) / numBins;
  }

  const bins = [];
  for (let i = 0; i < numBins; i++) {
    const binMin = min + i * binWidth;
    const binMax = binMin + binWidth;

    const binMinFormatted = binMin.toFixed(2);
    const binMaxFormatted = (binMax - 0.01).toFixed(2);

    bins.push({
      min: binMin,
      max: binMax,
      label: `${binMinFormatted} - ${binMaxFormatted}`,
    });
  }

  return bins;
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
