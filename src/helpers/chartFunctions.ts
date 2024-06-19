import { ChartData, ChartDataset } from "chart.js";
import { chartColors } from "../components/surveys/colors";
import { useSurveyStore } from "../store/surveyStore";
import { ResponseModel, responseCount, FilteredResponse, MultipleChoiceResponse } from "../types/response.model";
import { isNumericalQuestion, isYesNoQuestion, isMultipleChoiceQuestion } from "./questionMapping";
import { setMinMaxFromDataset, getOHLC } from "./numerical-charts";
import { parseDataForAreaChart, transformChartData } from "./yesno-charts";
import { addExpiredEntries } from "./shared-chartFunctions";
import { parseDataForFreeTextChart } from "./freetext-charts";

function filterNA(data: FilteredResponse[]): FilteredResponse[] {
  const store = useSurveyStore();
  return data.filter((item) => item.value !== "N/A" || store.settings.displayNA);
}

export function isInvalidSurvey(): boolean {
  const store = useSurveyStore();
  return store.getResponses.length === 0 || Object.keys(store.getQuestions).length === 0 || store.getParticipants.length === 0;
}

export function countResponsesFor(questionKey: string): responseCount[] {
  const store = useSurveyStore();

  const responseCounts: responseCount[] = [];

  let lastResponses = getLastResponses(addExpiredEntries(store.getFilteredResponses(questionKey)));

  lastResponses = filterNA(lastResponses);

  lastResponses.forEach((response) => {
    const answer = response.value;

    const existingIndex = responseCounts.findIndex((item) => item.name === answer);

    if (existingIndex !== -1) {
      responseCounts[existingIndex].value++;
    } else {
      responseCounts.push({ name: answer, value: 1 });
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

export function getMultipleChoiceResponses(questionKey: string, responses: ResponseModel[]): MultipleChoiceResponse[] {
  const store = useSurveyStore();
  const { available_answers } = store.getQuestions[questionKey];
  const result: MultipleChoiceResponse[] = [];
  if (!available_answers || typeof available_answers !== "object") {
    return result;
  }
  const responseKeys = Object.keys(available_answers);

  return responses.map((response) => {
    const answers = responseKeys.reduce(
      (acc, key) => {
        const answerKey = available_answers[key];
        const value = response[key];
        acc[answerKey] = value !== undefined && value !== null ? String(value) : "";
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      token: response.token,
      time: new Date(response.submitdate),
      answers: answers,
    } as MultipleChoiceResponse;
  });
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
  responseCounts.forEach(({ name, value }, index) => {
    labels.push(name);
    data.push(value);
    backgroundColor.push(chartColors[index % chartColors.length]);
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

export function getParticipant(token: string): string {
  const store = useSurveyStore();

  // participant where participant.token === token
  const participant = store.getParticipants.find((participant) => participant.token === token);
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

export function createNumericChartData(questionKey: string): ChartData<"candlestick"> {
  const store = useSurveyStore();
  if (store.selectedSurveyID === undefined) {
    console.error("No survey selected");
    return { datasets: [] };
  }

  const question_type = store.getQuestionType(questionKey);

  if (question_type === undefined) {
    console.error(`Question ${questionKey} not found`);
    return { datasets: [] };
  }

  const filteredResponses = aggregateResponses(store.getFilteredResponses(questionKey));

  store.updateTokenMap(store.selectedSurveyID);

  if (isNumericalQuestion(question_type)) {
    setMinMaxFromDataset(filteredResponses, questionKey);
    return getOHLC(filteredResponses, questionKey);
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

  if (question_type === undefined) {
    console.error(`Question ${questionKey} not found`);
    return { datasets: [] };
  }

  const filteredResponses = store.getFilteredResponses(questionKey);

  store.updateTokenMap(store.selectedSurveyID);

  if (isYesNoQuestion(question_type)) {
    const enrichedResponses = aggregateResponses(addExpiredEntries(filteredResponses));

    return transformChartData(parseDataForAreaChart(enrichedResponses)) as ChartData<"line">;
  }

  if (isMultipleChoiceQuestion(question_type)) {
    return parseDataForFreeTextChart(getMultipleChoiceResponses(questionKey, store.responsesInTimeline)) as ChartData<"line">;
  }

  return parseDataForFreeTextChart(filteredResponses) as ChartData<"line">;
}
