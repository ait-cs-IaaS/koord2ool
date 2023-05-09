/**
 * This is a stub of the DTO returned by LimeSurvey when retrieving questions.
 * https://api.limesurvey.org/classes/Question.html
 */
export interface QuestionModel {
  title: string;

  order?: number;

  question: string;

  help?: string;

  qid: number;

  mandatory?: "N" | "Y";

  type?: string;

  question_theme_name?: string;

  subquestions?: Record<string, string>;

  /**
   * This is a catch-all property for past, present, or future use.
   * It may or may not actually exist, and its type is intrinsically unknown.
   */
  [key: string]: unknown;
}
