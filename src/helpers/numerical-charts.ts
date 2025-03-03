import { ChartData } from "chart.js";
import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";
import { getQuestionText } from "./chartFunctions";

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
