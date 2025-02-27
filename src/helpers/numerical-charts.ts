import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";
import { getQuestionText } from "./chartFunctions";


export function getHistogramData(data: FilteredResponse[], questionKey: string) {  
  const valueData = data.map(item => ({
    value: Number(item.answer),
    timestamp: item.time,
    token: item.token
  }))
  .filter(item => !isNaN(item.value));
    
  if (valueData.length === 0) {
    return {
       labels: [],
      datasets: [],
      title: "No numerical data available"
    };
  }
  
  const values = valueData.map(item => item.value);

  const uniqueTokens = new Set(valueData.map(item => item.token)).size;  
  const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
  const valueCounts = uniqueValues.map(value => {
    const count = values.filter(v => v === value).length;
    return {
      value: value,
      count: count,
      label: value.toString(),
      percentage: ((count / values.length) * 100).toFixed(1)
    };
  });
    
  const questionText = getQuestionText(questionKey);
  const shortTitle = questionText.length > 40 ? 
    questionText.substring(0, 40) + '...' : 
    questionText;
  return {
    labels: valueCounts.map(item => item.label),
    datasets: [{
      data: valueCounts.map(item => item.count),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      label: `Responses (${values.length} total)`,
      barPercentage: 0.9,
      categoryPercentage: 0.8,
      originalData: valueCounts
    }],
    title: shortTitle,
    subtitle: `${uniqueTokens} participants, ${values.length} responses`
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