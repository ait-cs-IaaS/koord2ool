import { getQuestionText } from "../helpers/chartFunctions";
import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";

export function getHistogramData(data: FilteredResponse[], questionKey: string) {
  const values = data
    .map(item => Number(item.answer))
    .filter(value => !isNaN(value));

  const binCount = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount;

  const bins = Array.from({ length: binCount }, (_, i) => {
    const binStart = min + (i * binWidth);
    return {
      x: binStart + (binWidth / 2),
      y: 0
    };
  });

  values.forEach(value => {
    const binIndex = Math.min(
      Math.floor((value - min) / binWidth),
      binCount - 1
    );
    bins[binIndex].y++;
  });

  return bins;
}

export function getAverageLineChart(data: FilteredResponse[], questionKey: string) {
  return data.reduce((acc: {x: number, y: number}[], item) => {
    const value = Number(item.answer);
    if (!isNaN(value)) {
      acc.push({
        x: item.time.getTime(),
        y: value
      });
    }
    return acc;
  }, []).sort((a, b) => a.x - b.x);
}

export function setMinMaxFromDataset(filteredResponses: FilteredResponse[], questionKey: string) {
  const store = useSurveyStore();
  if (filteredResponses.length === 0) {
    store.setMinMax({ min: 0, max: 0 }, questionKey);
    return;
  }
  
  const values = filteredResponses
    .map(item => Number(item.answer))
    .filter(value => !isNaN(value));
    
  const minMax = {
    min: Math.min(...values),
    max: Math.max(...values)
  };
  
  store.setMinMax(minMax, questionKey);
}