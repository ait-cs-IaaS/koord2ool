import { ChartData, FinancialDataPoint } from "chart.js";
import { useSurveyStore } from "../store/surveyStore";
import { FilteredResponse, HLResponse } from "../types/response.model";
import { getQuestionText } from "../helpers/chartFunctions";

function aggregateForHL(data: FilteredResponse[]): HLResponse[] {
  const aggregatedData: { [key: string]: HLResponse } = {};
  data.forEach((item) => {
    const dateKey = item.time.toISOString().split("T")[0]; // Extract the date part
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
  const minMax: { min: number; max: number } = { min: 0, max: 0 };
  filteredResponses.forEach((item) => {
    const value = Number(item.answer);
    if (value < minMax.min) {
      minMax.min = value;
    }
    if (value > minMax.max) {
      minMax.max = value;
    }
  });
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
