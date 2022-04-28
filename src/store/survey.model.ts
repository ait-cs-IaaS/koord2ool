export default interface SurveyModel {
  sid: number;

  surveyls_title: string;

  startdate: string | null;

  expires: string | null;

  active: "Y" | "N";

  details?: Record<string, string | null>;

  [key: string]: unknown;
}
