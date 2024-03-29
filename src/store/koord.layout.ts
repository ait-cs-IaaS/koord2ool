import { SurveyModel } from "../types/survey.model";
import { ResponseModel } from "../types/response.model";
import { ParticipantModel } from "../types/participant.model";
import { SettingsModel } from "../types/settings.model";
import { LimesurveyApi } from "../api/limesurvey";
import { QuestionModel } from "../types/question.model";

export interface KoordLayout {
  /**
   * The LimeSurvey API facade, if authenticated.
   */
  limesurvey?: Record<string, string>;

  /**
   * A set of responses for a given survey, identified by its survey ID.
   */
  responses: Record<number, ResponseModel[]>;

  /**
   * A set of Questions for a given survey, identified by its survey ID.
   */
  questions: Record<number, Record<string, QuestionModel>>;

  /**
   * A list of survey metadata, identified by its survey ID.
   */
  surveys: Record<number, SurveyModel>;

  /**
   * A list of survey participants, identified by its survey ID.
   */
  participants: Record<number, ParticipantModel[]>;

  /**
   * Any active error that should be presented to the user.
   */
  error?: Error;

  selectedSurveyID?: number;

  responseRange: number[];

  settings: SettingsModel;

  tokenMap: Record<string, number>;

  api: LimesurveyApi;
}
