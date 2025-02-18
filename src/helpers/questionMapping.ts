import type { QuestionPropertyModel } from "../types/question_property.model";

type ChartType = "line" | "candlestick" | "area" | null;

const QUESTION_TYPE_MAPPING: Record<string, ChartType> = {
  yesno: "line",
  list_dropdown: "line",
  bootstrap_dropdown: "line",
  listradio: "line",
  numerical: "candlestick",
  multipleshorttext: "area",
  multiplechoice: "area",
} as const;

export function getChartType(question_type: string): ChartType {
  return QUESTION_TYPE_MAPPING[question_type] || null;
}

export function isQuestionTypeSupported(question_type: string): boolean {
  return getChartType(question_type) !== null;
}

export function isYesNoQuestion(question_type: string): boolean {
  return getChartType(question_type) === "line";
}

export function isNumericalQuestion(question_type: string): boolean {
  return getChartType(question_type) === "candlestick";
}

export function isMultipleChoiceQuestion(question_type: string): boolean {
  return getChartType(question_type) === "area";
}

export function renderAreaChart(question_type: string): boolean {
  return getChartType(question_type) === "area";
}

export function checkQuestionCompatibility(questions: Array<{ type: string } | QuestionPropertyModel> | { status: string }): boolean {
  if (!Array.isArray(questions)) return true;
  if (questions.length === 0) return true;
  return questions.every((q) => "type" in q && isQuestionTypeSupported(q.type));
}
