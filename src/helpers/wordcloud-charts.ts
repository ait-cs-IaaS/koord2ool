import { FilteredResponse } from "../types/response.model";

export function prepareWordCloudData(responses: FilteredResponse[]): FilteredResponse[] {
  return responses.filter((response) => {
    if (typeof response.answer === "string") {
      return response.answer && response.answer !== "N/A" && response.answer.trim() !== "";
    } else if (typeof response.answer === "object") {
      return Object.values(response.answer).some((value) => value && value !== "N/A" && typeof value === "string" && value.trim() !== "");
    }
    return false;
  });
}

export function isFreeTextQuestion(question_type: string): boolean {
  const freeTextTypes = ["text", "shorttext", "longtext", "longfreetext", "textarea", "comment"];

  return freeTextTypes.includes(question_type);
}
