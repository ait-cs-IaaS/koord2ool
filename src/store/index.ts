import { createStore } from "vuex";
import KoordStore from "@/store/koord.store";
import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";

export default createStore<KoordStore>({
  state: {
    surveys: new Map<number, SurveyModel>(),
  },
  getters: {
    getSurveyCount: (state) => state.surveys.size,
  },
  mutations: {
    setApi(state, api?: LimesurveyApi) {
      state.limesurvey = api;
    },

    setSurveyList(state, surveys: SurveyModel[] = []) {
      // TODO: elaborate merging?
      state.surveys = new Map<number, SurveyModel>(
        surveys.map((survey) => [survey.sid, survey])
      );
    },

    updateResponses(
      state,
      payload: { sid: number; responses: ResponseModel[] }
    ) {
      const survey = state.surveys.get(payload.sid);
      if (!survey) {
        throw new Error(`Survey ${payload.sid} not found`);
      }
      survey.responses = payload.responses;
    },

    updateSurvey(state, payload: SurveyModel) {
      const survey = state.surveys.get(payload.sid);
      if (!survey) {
        throw new Error(`Survey ${payload.sid} not found`);
      }
      survey.details = payload.details;
    },
  },
  actions: {
    async authenticate(
      state,
      payload: { username: string; password: string }
    ): Promise<void> {
      const api = new LimesurveyApi();
      const okay = await api.authenticate(payload.username, payload.password);
      console.debug("Authenticated with LimeSurvey", okay);

      if (okay) {
        state.commit("setApi", okay ? api : undefined);
        await state.dispatch("refreshSurveys");
      }
    },

    async refreshSurveys(state): Promise<void> {
      if (state.state.limesurvey) {
        state.commit(
          "setSurveyList",
          await state.state.limesurvey.listSurveys()
        );
      }
    },

    async refreshSurvey(state, sid: number): Promise<void> {
      if (state.state.limesurvey) {
        state.commit(
          "updateSurvey",
          await state.state.limesurvey.getSurvey(sid)
        );
      }
    },

    async refreshResponses(state, sid: number): Promise<void> {
      if (state.state.limesurvey) {
        const responses = await state.state.limesurvey.getResponses(sid);
        console.debug(`Responses ${sid}:`, responses);
        if (typeof responses !== "undefined") {
          state.commit("updateResponses", {
            sid,
            responses,
          });
        }
      }
    },
  },
  modules: {},
});
