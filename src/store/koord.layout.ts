import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";

export default interface KoordLayout {
  limesurvey?: LimesurveyApi;

  responses: Record<number, ResponseModel[]>;

  surveys: Record<number, SurveyModel>;

  syncing: boolean;
}
