import QuestionPropertyModel from "./question_property.model";

/**
 * This is a stub of the DTO returned by LimeSurvey when retrieving questions.
 * https://api.limesurvey.org/classes/Question.html
 */
export default interface QuestionModel {
  title: string;

  order?: number;

  question: string;

  help?: string;

  qid: number;

  mandatory?: "N" | "Y";

  type?: string;

  question_theme_name?: string;

  question_properties?: QuestionPropertyModel;

  /**
   * This is a catch-all property for past, present, or future use.
   * It may or may not actually exist, and its type is intrinsically unknown.
   */
  [key: string]: unknown;
}
