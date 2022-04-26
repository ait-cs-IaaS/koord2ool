export default interface SurveyModel {
  sid: number;

  surveyls_title: string;

  startdate: string | null;

  expires: string | null;

  active: "Y" | "N";

  [key: string]: unknown;
}
