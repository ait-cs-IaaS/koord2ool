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
  return responses.map((response) => new Date(response.submitdate)).reduce((max, date) => (date > max ? date : max), new Date());
}

export function responseMapper(questionKey: string, response: ResponseModel): FilteredResponse {
  return {
    token: response.token,
    time: new Date(response.submitdate),
    value: response[questionKey] || "N/A",
  };
}
