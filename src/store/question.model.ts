/**
 * This is a stub of the DTO returned by LimeSurvey when retrieving questions.
 * https://api.limesurvey.org/classes/Question.html
 */
export interface QuestionModel {
  title: string;

  order?: number;

  question: string;

  help?: string;

  qid: number;

  mandatory?: "N" | "Y";

  type?: string;

  question_theme_name?: string;

  subquestions?: Record<string, string>;

  /**
   * This is a catch-all property for past, present, or future use.
   * It may or may not actually exist, and its type is intrinsically unknown.
   */
  [key: string]: unknown;
}

export function getQuestionText(
  questionKey: string,
  questions: Record<string, QuestionModel>
): string {
  const key = questionKey.split("[");
  const question = questions[key[0]];
  if (key.length === 1) return question.question;
  const subquestion = key[1].split("]")[0];
  if (question.subquestions !== undefined && subquestion !== undefined) {
    if (question.subquestions[subquestion] !== undefined) {
      return question.subquestions[subquestion];
    }
  }
  return question.question;
}
