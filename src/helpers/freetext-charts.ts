import { ChartData, ChartDataset } from "chart.js";
import { useSurveyStore } from "../store/surveyStore";
import { FilteredResponse } from "../types/response.model";
import { getBorderColor } from "./shared-chartFunctions";

export function parseDataForFreeTextChart(data: FilteredResponse[]): ChartData<"line"> {
  const parsedData: Record<string, ChartDataset<"line">> = {};
  const store = useSurveyStore();

  data.forEach((item) => {
    if (!parsedData[item.token]) {
      parsedData[item.token] = {
        label: item.token,
        data: [],
        fill: false,
        borderColor: getBorderColor(item.token),
      };
    }

    let tooltip: string | string[] = "";
    if (typeof item.answer === "string") {
      tooltip = item.answer;
    } else {
      tooltip = Object.entries(item.answer).map(([key, value]) => `${key}: ${value}`);
    }

    const point = {
      tooltip: tooltip,
      x: item.time.getTime(),
      y: store.tokenMap[item.token] || 0,
    };
    parsedData[item.token].data.push(point);
  });

  return {
    datasets: Object.values(parsedData),
  };
}
