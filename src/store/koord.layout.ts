import { SurveyModel } from "../types/survey.model";
import { ResponseModel } from "../types/response.model";
import { ParticipantModel } from "../types/participant.model";
import { SettingsModel } from "../types/settings.model";
import { LimesurveyApi } from "../api/limesurvey";

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

  api: LimesurveyApi;
}
