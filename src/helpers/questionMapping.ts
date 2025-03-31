import type { QuestionModel } from "../types/question.model";

type ChartType = "line" | "area" | "doughnut" | "histogram" | "candlestick" | null;

const QUESTION_TYPE_MAPPING: Record<string, ChartType> = {
  yesno: "area",
  list_dropdown: "area",
  bootstrap_dropdown: "area",
  listradio: "area",
  numerical: "candlestick",
  multipleshorttext: "area",
  multiplechoice: "area",
  shortfreetext: "line",
  longfreetext: "line",
} as const;

const QUESTION_TYPE_ACTIVE_CHART_MAPPING: Record<string, ChartType> = {
  yesno: "doughnut",
  list_dropdown: "doughnut",
  bootstrap_dropdown: "doughnut",
  listradio: "doughnut",
  numerical: "histogram",
  multipleshorttext: "doughnut",
  multiplechoice: "doughnut",
} as const;

export function getActiveChartType(question_type: string): ChartType {
  return QUESTION_TYPE_ACTIVE_CHART_MAPPING[question_type] || null;
}

export function getChartType(question_type: string): ChartType {
  return QUESTION_TYPE_MAPPING[question_type] || null;
}

export function isQuestionTypeSupported(question_type: string): boolean {
  return getChartType(question_type) !== null;
}

export function isSingleChoiceQuestion(question_type: string): boolean {
  return getChartType(question_type) === "area";
}

export function isNumericalQuestion(question_type: string): boolean {
  return question_type === "numerical";
}

export function isMultipleChoiceQuestion(question_type: string): boolean {
  return getChartType(question_type) === "area";
}

export function checkQuestionCompatibility(questions: QuestionModel[]): boolean {
  if (!Array.isArray(questions)) {
    return false;
  }
  if (questions.length === 0) {
    return false;
  }
  return questions.every((q) => {
    if (!q.question_theme_name) {
      return false;
    }
    return isQuestionTypeSupported(q.question_theme_name);
  });
}
