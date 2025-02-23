import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";

export function getHistogramData(data: FilteredResponse[]) {
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

  return {
    labels: bins.map(bin => `${(bin.x - binWidth/2).toFixed(1)} - ${(bin.x + binWidth/2).toFixed(1)}`),
    datasets: [{
      data: bins.map(bin => bin.y),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };
}

export function getAverageLineChart(data: FilteredResponse[]) {
  const timePoints = data
    .map(item => ({
      x: item.time.getTime(),
      y: Number(item.answer)
    }))
    .filter(point => !isNaN(point.y))
    .sort((a, b) => a.x - b.x);

  return {
    datasets: [{
      data: timePoints,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      tension: 0.1
    }]
  };
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