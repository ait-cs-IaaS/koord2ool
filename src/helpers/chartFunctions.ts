import { ChartData, ChartDataset } from "chart.js";
import { useSurveyStore } from "../store/surveyStore";
import { responseCount, FilteredResponse } from "../types/response.model";
import { isNumericalQuestion, isYesNoQuestion, isMultipleChoiceQuestion } from "./questionMapping";
import { setMinMaxFromDataset } from "./numerical-charts";
import { parseDataForAreaChart, transformChartData } from "./yesno-charts";
import { addExpiredEntries, getBorderColor } from "./shared-chartFunctions";
import { parseDataForFreeTextChart } from "./freetext-charts";
import { QuestionModel } from "../types/question.model";
import { ParticipantModel } from "../types/participant.model"; // Add this import

function filterNA(data: FilteredResponse[]): FilteredResponse[] {
  const store = useSurveyStore();
  return data.filter((item) => item.answer !== "N/A" || store.settings.displayNA);
}

export function isInvalidSurvey(): boolean {
  const store = useSurveyStore();
  return store.getResponses.length === 0 || Object.keys(store.getQuestions).length === 0 || store.getParticipants.length === 0;
}

function countResponses(responseCounts: responseCount[], answer: string): responseCount[] {
  const existingIndex = responseCounts.findIndex((item) => item.name === answer);

  if (existingIndex !== -1) {
    responseCounts[existingIndex].value++;
  } else {
    responseCounts.push({ name: answer, value: 1 });
  }

  return responseCounts;
}

export function countResponsesFor(questionKey: string): responseCount[] {
  const store = useSurveyStore();

  const responseCounts: responseCount[] = [];
  const multiplechoice = isMultipleChoiceQuestion(store.getQuestionType(questionKey));

  let lastResponses = getLastResponses(addExpiredEntries(store.getFilteredResponses(questionKey)));

  lastResponses = filterNA(lastResponses);
  lastResponses.forEach((response) => {
    if (multiplechoice && typeof response.answer === "object") {
      const answers = response.answer as Record<string, string>;
      Object.entries(answers).forEach(([key, answer]) => {
        if (answer === "Yes") {
          console.debug(`Answer: ${key}: ${answer} - questionKey: ${questionKey}`);
          countResponses(responseCounts, key);
        }
      });
    } else {
      const answer = response.answer as string;
      countResponses(responseCounts, answer);
    }
  });

  return responseCounts;
}

export function getLastResponses(responses: FilteredResponse[]): FilteredResponse[] {
  const lastResponses: Record<string, FilteredResponse> = {};

  responses.forEach((response) => {
    const { token } = response;
    if (!lastResponses[token] || response.time > lastResponses[token].time) {
      lastResponses[token] = response;
    }
  });

  return Object.values(lastResponses);
}

export function getQuestionText(questionKey: string): string {
  const store = useSurveyStore();
  const questions = store.getQuestions;
  const key = questionKey.split("[");
  const question = questions[key[0]];
  if (question === undefined) {
    return "";
  }
  if (key.length === 1) {
    return question.question;
  }
  const subquestion = key[1].split("]")[0];
  if (question.subquestions !== undefined && subquestion !== undefined && question.subquestions[subquestion] !== undefined) {
    return question.subquestions[subquestion];
  }
  return question.question;
}

export function doughnutChartData(responseCounts: responseCount[]): ChartData<"doughnut"> {
  const labels: string[] = [];
  const datasets: ChartDataset<"doughnut">[] = [];
  const data: number[] = [];
  const backgroundColor: string[] = [];
  responseCounts.forEach(({ name, value }) => {
    labels.push(name);
    data.push(value);
    backgroundColor.push(getBorderColor(name));
  });
  datasets.push({
    data,
    backgroundColor,
  });

  return {
    labels,
    datasets,
  };
}

export function getQuestion(qid: number): QuestionModel | undefined {
  const store = useSurveyStore();
  // Explicitly type the questions array and use proper type casting
  const questions = Object.values(store.getQuestions) as QuestionModel[];
  return questions.find((question) => question.qid === qid);
}

export function getQuestionTitle(qid: number): string {
  console.debug(`getQuestionTitle(${qid})`);
  const question = getQuestion(qid);
  return question?.title || `${qid}`;
}
export function getParticipant(token: string): string {
  const store = useSurveyStore();

  const participant = store.getParticipants.find((p: ParticipantModel) => p.token === token);
  return participant ? `${participant.participant_info.firstname} ${participant.participant_info.lastname}` : token;
}

export function aggregateResponses(data: FilteredResponse[]): FilteredResponse[] {
  const store = useSurveyStore();

  if (store.settings.timeFormat !== "stepped") {
    return data;
  }

  const aggregatedData: FilteredResponse[] = [];

  const { step } = store.settings;

  // if there are multiple responses from the same token withing step hours of time aggregate them
  data.forEach((item) => {
    const lastResponse = aggregatedData.find(
      (response) => response.token === item.token && response.time.getTime() + step * 60 * 60 * 1000 > item.time.getTime(),
    );

    if (!lastResponse) {
      aggregatedData.push(item);
    }
  });

  console.debug(`Aggregated ${data.length} responses to ${aggregatedData.length}`);
  return aggregatedData;
}

export function createNumericChartData(questionKey: string) {
  const store = useSurveyStore();
  console.debug('Creating numeric chart for:', questionKey);

  if (store.selectedSurveyID === undefined) {
    console.error("No survey selected");
    return { datasets: [] };
  }

  const question_type = store.getQuestionType(questionKey);
  const filteredResponses = aggregateResponses(store.getFilteredResponses(questionKey));
  store.updateTokenMap(store.selectedSurveyID);

  if (isNumericalQuestion(question_type)) {
    setMinMaxFromDataset(filteredResponses, questionKey);
    
    if (store.settings.timeFormat === 'real') {
      const values = filteredResponses
        .map(item => Number(item.answer))
        .filter(value => !isNaN(value));

      const binCount = 10;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binWidth = (max - min) / binCount;

      const bins = Array.from({ length: binCount }, (_, i) => {
        const start = min + (i * binWidth);
        const end = start + binWidth;
        return {
          label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
          count: 0
        };
      });

      values.forEach(value => {
        const binIndex = Math.min(
          Math.floor((value - min) / binWidth),
          binCount - 1
        );
        bins[binIndex].count++;
      });

      return {
        labels: bins.map(bin => bin.label),
        datasets: [{
          data: bins.map(bin => bin.count),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          label: getQuestionText(questionKey)
        }]
      };
    }
    
    const timePoints = filteredResponses.map(response => ({
      x: response.time.getTime(),
      y: Number(response.answer)
    })).sort((a, b) => a.x - b.x);

    return {
      datasets: [{
        data: timePoints,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.1,
        label: getQuestionText(questionKey)
      }]
    };
  }

  return { datasets: [] };
}
export function createTimelineFor(questionKey: string): ChartData<"line"> {
  const store = useSurveyStore();
  if (store.selectedSurveyID === undefined) {
    console.error("No survey selected");
    return { datasets: [] };
  }

  const question_type = store.getQuestionType(questionKey);

  const filteredResponses = store.getFilteredResponses(questionKey);

  store.updateTokenMap(store.selectedSurveyID);

  if (isYesNoQuestion(question_type)) {
    const enrichedResponses = aggregateResponses(addExpiredEntries(filteredResponses));

    return transformChartData(parseDataForAreaChart(enrichedResponses));
  }

  if (isMultipleChoiceQuestion(question_type)) {
    return transformChartData(parseDataForAreaChart(filteredResponses));
  }

  return parseDataForFreeTextChart(filteredResponses);
}
