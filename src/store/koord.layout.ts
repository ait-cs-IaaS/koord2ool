import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";
import { ParticipantModel } from "@/store/participant.model";

/**
 * This is the layout for the internal Vuex store.
 */
export default interface KoordLayout {
  /**
   * The LimeSurvey API facade, if authenticated.
   */
  limesurvey?: LimesurveyApi;

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
  participants: Record<number, ParticipantModel>;

  /**
   * Any active error that should be presented to the user.
   */
  error?: Error;

  /**
   * A flag indicating whether the application is currently syncing or not.
   * @deprecated
   */
  syncing: boolean;
}
