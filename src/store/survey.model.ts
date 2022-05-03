import QuestionModel from "@/store/question.model";

export default interface SurveyModel {
  sid: number;

  surveyls_title: string;

  startdate: string | null;

  expires: string | null;

  active: "Y" | "N";

  details?: Record<string, string | null>;

  questions?: Record<string, QuestionModel>;

  [key: string]: unknown;
}
