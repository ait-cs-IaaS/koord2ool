import { ResponseModel, FilteredResponse } from "../types/response.model";

export const ignoreKeys: (keyof ResponseModel)[] = [
  "datestamp",
  "id",
  "ipaddr",
  "lastpage",
  "seed",
  "startlanguage",
  "startdate",
  "submitdate",
  "token",
  "$validUntil",
];

export function hasSubmitDate(response: ResponseModel): boolean {
  return response.submitdate !== "1980-01-01 00:00:00";
}

export function hasSubmitDateMatch(responses: ResponseModel[]): boolean {
  return responses.every(hasSubmitDate);
}

export function minResponseDate(responses: ResponseModel[]): Date {
  return responses.map((response) => new Date(response.submitdate)).reduce((min, date) => (date < min ? date : min), new Date());
}

export function maxResponseDate(responses: ResponseModel[]): Date {
  return responses.map((response) => new Date(response.submitdate)).reduce((max, date) => (date > max ? date : max), new Date(0));
}

export function responseMapper(questionKey: string, response: ResponseModel): FilteredResponse {
  return {
    token: response.token,
    time: new Date(response.submitdate),
    answer: response[questionKey] || "N/A",
  };
}

export function multipleChoiceResponseMapper(available_answers: string | Record<string, string>, response: ResponseModel): FilteredResponse {
  if (typeof available_answers !== "object") {
    return responseMapper(available_answers, response);
  }

  const responseKeys = Object.keys(available_answers);

  const answers = responseKeys.reduce(
    (acc, key) => {
      const answerKey = available_answers[key];
      const value = response[key];
      if (value !== "N/A") {
        acc[answerKey] = value !== undefined && value !== null ? String(value) : "";
      }
      return acc;
    },
    {} as Record<string, string>,
  );
  return {
    token: response.token,
    time: new Date(response.submitdate),
    answer: answers,
  };
}
