export default interface SurveyModel {
  sid: number;

  surveyls_title: string;

  startdate: string | null;

  expires: string | null;

  active: "Y" | "N";

  details?: any;

  responses?: any;

  [key: string]: unknown;
}
