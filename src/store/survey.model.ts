import QuestionModel from "@/store/question.model";

/**
 * This is a stub of the DTO returned by LimeSurvey when retrieving surveys.
 */
export default interface SurveyModel {
  sid: number;

  surveyls_title: string;

  startdate: string | null;

  expires: string | null;

  active: "Y" | "N";

  details?: Record<string, string | null>;

  questions?: Record<string, QuestionModel>;

  /**
   * This is a catch-all property for past, present, or future use.
   * It may or may not actually exist, and its type is intrinsically unknown.
   */
  [key: string]: unknown;
}
