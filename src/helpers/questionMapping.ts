import type { QuestionPropertyModel } from '../types/question_property.model';

const SupportedQuestionTypes = {
  yesno: true,
  list_dropdown: true,
  bootstrap_dropdown: true,
  listradio: true,
  numerical: true,
  multipleshorttext: true,
  multiplechoice: true
} as const;

export function isYesNoQuestion(question_type: string): boolean {
  return (
    question_type === "yesno" || question_type === "list_dropdown" || question_type === "bootstrap_dropdown" || question_type === "listradio"
  );
}

export function isNumericalQuestion(question_type: string): boolean {
  return question_type === "numerical";
}

export function isMultipleChoiceQuestion(question_type: string): boolean {
  return question_type === "multipleshorttext" || question_type === "multiplechoice";
}

export function renderAreaChart(question_type: string): boolean {
  return isMultipleChoiceQuestion(question_type) || isYesNoQuestion(question_type);
}

export function isQuestionTypeSupported(question_type: string): boolean {
  return question_type in SupportedQuestionTypes;
}

export function checkQuestionCompatibility(questions: Array<{ type: string } | QuestionPropertyModel>): boolean {
  if (!Array.isArray(questions)) return false;
  return questions.every(q => isQuestionTypeSupported(q.type));
}
