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
