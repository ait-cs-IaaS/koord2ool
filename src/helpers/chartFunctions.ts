import { ChartData, ChartDataset } from "chart.js";
import { chartColors } from "../components/surveys/colors";
import { koordStore } from "../store";
import {
  ResponseModel,
  responseCount,
  FilteredResponse,
} from "../types/response.model";
import { QuestionModel } from "../types/question.model";

function getBorderColor(key: string): string {
  return chartColors[
    key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      chartColors.length
  ];
}

export function countResponsesFor(
  questionKey: string,
  lastResponses: ResponseModel[]
): responseCount[] {
  const responseCounts: responseCount[] = [];
  lastResponses.forEach((response) => {
    const answer = getAnswer(questionKey, response);

    const existingIndex = responseCounts.findIndex(
      (item) => item.name === answer
    );

    if (existingIndex !== -1) {
      responseCounts[existingIndex].value++;
    } else {
      responseCounts.push({ name: answer, value: 1 });
    }
  });

  responseCounts.sort((a, b) => {
    if (a.name.length === b.name.length) return 0;
    return a.name.length - b.name.length;
  });

  return responseCounts;
}

function isResponseExpired(response: ResponseModel, expireDate: Date): boolean {
  return new Date(response.submitdate) <= expireDate;
}

function getAnswer(questionKey: string, response: ResponseModel): string {
  const store = koordStore();
  if (isResponseExpired(response, store.getExpireDate)) {
    return "N/A";
  }
  return response[questionKey] || "N/A";
}

function responseMapper(
  questionKey: string,
  response: ResponseModel
): FilteredResponse {
  return {
    token: response.token,
    time: new Date(response.submitdate),
    value: response[questionKey] || "N/A",
  };
}

function expirationDate(relativeDate: Date): Date {
  const store = koordStore();
  return new Date(
    relativeDate.getTime() + store.settings.expirationTime * 24 * 60 * 60 * 1000
  );
}

function subtractSecond(date: Date): Date {
  date.setSeconds(date.getSeconds() - 1);

  return date;
}

export function addExpiredEntries(
  responses: FilteredResponse[]
): FilteredResponse[] {
  const newResponses: FilteredResponse[] = [...responses];
  const currentDate = new Date();

  responses.forEach((response) => {
    const expiredTime = expirationDate(response.time);

    const hasEntryWithinExpiration = newResponses.some((existingResponse) => {
      return (
        existingResponse.token === response.token &&
        existingResponse.time >= response.time &&
        existingResponse.time <= expiredTime &&
        existingResponse !== response
      );
    });

    if (!hasEntryWithinExpiration && expiredTime <= currentDate) {
      const expiredResponse: FilteredResponse = {
        token: response.token,
        time: expiredTime,
        value: "N/A",
      };

      newResponses.push(expiredResponse);
    }
  });

  return newResponses;
}

export function filterResponses(
  questionKey: string,
  responses: ResponseModel[]
): FilteredResponse[] {
  return responses
    .map((response) => responseMapper(questionKey, response))
    .sort((a, b) => a.time.valueOf() - b.time.valueOf());
}

function getAllTokens(responses: FilteredResponse[]): string[] {
  const tokens: string[] = [];

  responses.forEach((response) => {
    if (!tokens.includes(response.token)) {
      tokens.push(response.token);
    }
  });

  return tokens;
}

export function addCurrentStateForEachToken(
  responses: FilteredResponse[]
): FilteredResponse[] {
  const newResponses: FilteredResponse[] = [...responses];
  const tokens = getAllTokens(newResponses);

  responses.forEach((response) => {
    tokens.forEach((token) => {
      if (token !== response.token) {
        const previousEntry = newResponses
          .filter(
            (entry) => entry.token === token && entry.time <= response.time
          )
          .sort((a, b) => b.time.getTime() - a.time.getTime())[0];

        const currentState: FilteredResponse = {
          token: token,
          time: response.time,
          value: previousEntry ? previousEntry.value : "N/A",
        };

        newResponses.push(currentState);
      }
    });
  });

  return newResponses.sort((a, b) => a.time.getTime() - b.time.getTime());
}

export function getQuestionText(
  questionKey: string,
  questions: Record<string, QuestionModel>
): string {
  const key = questionKey.split("[");
  const question = questions[key[0]];
  if (question === undefined) return "";
  if (key.length === 1) return question.question;
  const subquestion = key[1].split("]")[0];
  if (question.subquestions !== undefined && subquestion !== undefined) {
    if (question.subquestions[subquestion] !== undefined) {
      return question.subquestions[subquestion];
    }
  }
  return question.question;
}

export function getQuestionType(
  questionKey: string,
  questions: Record<string, QuestionModel>
): string {
  const key = questionKey.split("[");
  const question = questions[key[0]];
  if (question === undefined) return "";
  return question.question_theme_name || "";
}

export function parseDataForLineChart(
  data: FilteredResponse[],
  question_type = ""
): ChartData<"line"> {
  const parsedData: ChartDataset<"line">[] = [];
  const store = koordStore();

  const filteredData = data.filter((item) => item.value !== "N/A");
  const naData = data.filter(
    (item) => store.settings.displayNA && item.value === "N/A"
  );
  const combinedData = [...filteredData, ...naData];
  const values = new Set(combinedData.map((item) => item.value));

  values.forEach((value) => {
    const aggregatedData: Record<number, number> = data
      .filter((item) => item.value === value)
      .reduce((acc: Record<number, number>, item) => {
        const dateKey = item.time.getTime();
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey]++;
        return acc;
      }, {});

    const lineData = Object.entries(aggregatedData).map(([date, count]) => ({
      x: parseInt(date),
      y: count,
    }));

    if (lineData.length > 0) {
      parsedData.push({
        label: value,
        data: lineData,
        fill: question_type === "yesno" ? "origin" : false,
        backgroundColor: getBorderColor(value),
      });
    }
  });

  return {
    datasets: parsedData,
  };
}

export function createTimelineFor(
  questionKey: string,
  surveyId: number
): ChartData<"line"> {
  const store = koordStore();
  const filteredResponses = filterResponses(
    questionKey,
    store.responsesInTimeline(surveyId)
  );
  const question_type = store.getQuestionType(surveyId, questionKey);
  const enrichedResponses = addExpiredEntries(filteredResponses);
  const result = addCurrentStateForEachToken(enrichedResponses);

  return parseDataForLineChart(result, question_type);
}
