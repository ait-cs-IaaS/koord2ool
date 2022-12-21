/**
 * This is a stub of the DTO returned by LimeSurvey when retrieving survey responses.
 *
 * Question responses are usually part of this DTO as well, where the provided
 * question keys are properties in this DTO.
 */
export default interface ResponseModel {
  id: string;

  ipaddr?: string;

  lastpage?: string;

  seed?: string;

  startlanguage?: string;

  datestamp?: string;

  startdate?: string;

  submitdate: string;

  token: string;

  $validUntil?: string;

  /**
   * This is a catch-all property for question data.
   *
   * If `undefined`, there does not appear to be any such question.
   * If `null`, the question exists in general, but the user chose not to answer.
   * Otherwise, expect a `string` here.
   */
  [question: string]: string | null | undefined;
}

export function getQuestionsFromResponses(
  response: ResponseModel
): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(response).forEach(([key, value]) => {
    if (key.startsWith("Q") && typeof value === "string") {
      if (key.indexOf("[") === -1) {
        result[key] = value;
      } else {
        const questionKey = key.substring(0, key.indexOf("["));
        result[questionKey] = value;
      }
    }
  });
  return result;
}

export function hasSubmitDate(response: ResponseModel): boolean {
  return response.submitdate !== "1980-01-01 00:00:00";
}

export function hasSubmitDateMatch(responses: ResponseModel[]): boolean {
  return responses.every(hasSubmitDate);
}

export function minResponseDate(responses: ResponseModel[]): Date {
  return responses
    .map((response) => new Date(response.submitdate))
    .reduce((min, date) => (date < min ? date : min), new Date());
}

export function maxResponseDate(responses: ResponseModel[]): Date {
  return responses
    .map((response) => new Date(response.submitdate))
    .reduce((max, date) => (date > max ? date : max), new Date());
}
