import { ChartData, FinancialDataPoint } from "chart.js";
import { useSurveyStore } from "../store/surveyStore";
import { FilteredResponse, HLResponse } from "../types/response.model";
import { getQuestionText } from "../helpers/chartFunctions";

function aggregateForHL(data: FilteredResponse[]): HLResponse[] {
  console.debug('Aggregating HL data:', data);
  const aggregatedData: { [key: string]: HLResponse } = {};
  data.forEach((item) => {
    const dateKey = item.time.toISOString().split("T")[0];
    const currentValue = Number(item.answer);
    
    if (!aggregatedData[dateKey]) {
      aggregatedData[dateKey] = {
        token: item.token,
        time: new Date(dateKey),
        lowValue: currentValue,
        highValue: currentValue,
      };
    } else {
      aggregatedData[dateKey].lowValue = Math.min(aggregatedData[dateKey].lowValue, currentValue);
      aggregatedData[dateKey].highValue = Math.max(aggregatedData[dateKey].highValue, currentValue);
    }
  });

  const result = Object.values(aggregatedData);
  console.debug('Aggregated HL data result:', result);
  return result;
}
function aggregateForAverage(data: FilteredResponse[]): { time: Date; average: number }[] {
  const aggregatedData: { [key: string]: { sum: number; count: number; time: Date } } = {};
  
  data.forEach((item) => {
    const dateKey = item.time.toISOString().split("T")[0];
    const value = Number(item.answer);
    
    if (!aggregatedData[dateKey]) {
      aggregatedData[dateKey] = {
        sum: value,
        count: 1,
        time: new Date(dateKey)
      };
    } else {
      aggregatedData[dateKey].sum += value;
      aggregatedData[dateKey].count += 1;
    }
  });

  return Object.values(aggregatedData).map(({ sum, count, time }) => ({
    time,
    average: sum / count
  }));
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
  console.debug('Getting OHLC data for:', questionKey, data);
  const hldata = aggregateForHL(data);
  const datasets: FinancialDataPoint[] = [];
  hldata.forEach((item) => {
    console.debug('Processing HL item:', item);
    const point: FinancialDataPoint = {
      x: item.time.getTime(),
      o: Number(item.lowValue),
      h: Number(item.highValue),
      l: Number(item.lowValue),
      c: Number(item.highValue),
    };
    datasets.push(point);
  });

  console.debug('Final OHLC datasets:', datasets);
  return {
    datasets: [
      {
        label: getQuestionText(questionKey),
        data: datasets,
      },
    ],
  };
}

export function getAverageLineChart(data: FilteredResponse[], questionKey: string): ChartData<"line"> {
  const averageData = aggregateForAverage(data);
  
  console.debug('Average data:', averageData);
  
  return {
    labels: averageData.map(point => point.time),
    datasets: [{
      label: getQuestionText(questionKey),
      data: averageData.map(point => ({
        x: point.time.getTime(),
        y: Number(point.average.toFixed(2))
      })),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: false
    }]
  };
}
