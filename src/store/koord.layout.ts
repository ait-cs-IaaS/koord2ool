import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";
import { ParticipantModel } from "@/store/participant.model";

export default interface KoordLayout {
  limesurvey?: LimesurveyApi;

  responses: Record<number, ResponseModel[]>;

  surveys: Record<number, SurveyModel>;

  participants: Record<number, ParticipantModel>;

  syncing: boolean;
}
