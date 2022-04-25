import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";

export default interface KoordStore {
  limesurvey?: LimesurveyApi;

  surveys: SurveyModel[];
}
