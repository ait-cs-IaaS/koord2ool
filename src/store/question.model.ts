export default interface QuestionModel {
  title: string;

  order?: number;

  question: string;

  help?: string;

  mandatory?: "N" | "Y";

  type?: string;

  [key: string]: unknown;
}
