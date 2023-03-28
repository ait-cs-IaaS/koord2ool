import SurveyModel from "./survey.model";
import { ResponseModel } from "./response.model";
import { ParticipantModel } from "./participant.model";
import { SettingsModel } from "./settings.model";


export default interface KoordLayout {
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

  /**
   * A flag indicating whether the application is currently syncing or not.
   * @deprecated
   */
  syncing: boolean;

  selectedSurveyID?: number;

  responseRange: number[];

  settings: SettingsModel;
}
