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

  submitdate?: string;

  token: string;

  TIME: string;

  $validUntil?: string;

  /**
   * This is a catch-all property for question data.
   *
   * Iff `undefined`, there does not appear to be any such question.
   * Iff `null`, the question exists in general, but the user chose not to answer.
   * Otherwise, expect a `string` here.
   */
  [question: string]: string | null | undefined;
}

export const ignoreKeys: (keyof ResponseModel)[] = [
  "id",
  "ipaddr",
  "lastpage",
  "seed",
  "startlanguage",
  "submitdate",
  "$validUntil",
];

/**
 * This method strips the provided response of metadata or other
 * critical information that should probably not be presented to
 * the user.
 * @param response the response to strip data from.
 */
export function strip(response: ResponseModel): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(response).forEach(([key, value]) => {
    if (
      !ignoreKeys.includes(key as keyof ResponseModel) &&
      typeof value === "string"
    ) {
      result[key] = value;
    }
  });
  return result;
}
