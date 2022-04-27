import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";

export default interface KoordStore {
  limesurvey?: LimesurveyApi;

  responses: Map<number, ResponseModel[]>;

  surveys: Map<number, SurveyModel>;
}
