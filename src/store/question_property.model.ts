/**
 * This is a stub of the DTO returned by LimeSurvey when retrieving questions.
 * https://api.limesurvey.org/classes/Question.html
 */
export interface SubQuestionModel {
  question: string;
  scale_id: string;
  title: string;
}

export default interface QuestionPropertyModel {
  qid: string;
  parent_qid: string;
  sid: string;
  gid: string;
  type: string;
  title: string;
  preg?: string;
  other?: string;
  mandatory?: string;
  question_order?: string;
  scale_id?: string;
  same_default?: string;
  relevance?: string;
  modulename?: string;
  encrypted?: string;
  question_theme_name?: string;
  available_answers?: string | Record<string, string>;
  subquestions?: string | Record<string, SubQuestionModel>;
  attributes?: string | Record<string, string>;
  attributes_lang?: string | Record<string, string>;
  answeroptions?: string | Record<string, string>;
}
