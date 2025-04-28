import { QuestionPropertyModel } from "../types/question_property.model";
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

function normalizeQuestionType(limeType: string): string {
  const mapping: Record<string, string> = {
    T: "longfreetext",
    S: "shortfreetext",
    "5": "list_dropdown",
    Y: "yesno",
    N: "numerical",
    M: "multiplechoice",
    L: "listradio",
    O: "list_dropdown",
    "!": "unsupported",
  };
  return mapping[limeType] || limeType;
}

export function isFreeTextQuestion(question_type: string): boolean {
  const textQuestionTypes = [
    "shortfreetext",
    "longfreetext",
    "text",
    "huge_free_text",
    "long_free_text",
    "short_free_text",
    "multiple_short_text",
    "input_on_demand",
  ];
  return textQuestionTypes.includes(question_type.toLowerCase().replace(/\s+/g, "_"));
}

export function checkQuestionCompatibility(questions: Array<{ type: string } | QuestionPropertyModel> | { status: string }): boolean {
  if (!Array.isArray(questions)) return true;
  if (questions.length === 0) return true;
  return questions.some((q) => "type" in q && isQuestionTypeSupported(normalizeQuestionType(q.type)));
}
