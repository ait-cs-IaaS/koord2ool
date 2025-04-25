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
  const textQuestionTypes = [
    "shortfreetext",
    "longfreetext",
    "text",
    "huge_free_text",
    "long_free_text",
    "short_free_text",
    "multiple_short_text",
    "input_on_demand",
  ];

  return textQuestionTypes.includes(question_type.toLowerCase().replace(/\s+/g, "_"));
}
