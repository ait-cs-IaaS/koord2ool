/**
 * This is a stub of the DTO returned by LimeSurvey when retrieving survey responses.
 *
 * Question responses are usually part of this DTO as well, where the provided
 * question keys are properties in this DTO.
 */
export interface ResponseModel {
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

export interface responseCount {
  name: string;
  value: number;
}

export interface FilteredResponse {
  token: string;
  time: Date;
  value: string;
}

export interface HyperResponse {
  time: Date;
  values: Map<string, Array<string>>;
}
