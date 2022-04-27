import { createStore } from "vuex";
import KoordStore from "@/store/koord.store";
import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";

export default createStore<KoordStore>({
  state: {
    responses: new Map<number, ResponseModel[]>(),

    surveys: new Map<number, SurveyModel>(),
  },
  getters: {
    getSurveys: (state) => state.surveys.keys(),

    getSurveyCount: (state) => state.surveys.size,

    isAuthenticated: (state) => typeof state.limesurvey !== "undefined",
  },
  mutations: {
    setApi(state, api?: LimesurveyApi) {
      state.limesurvey = api;
    },

    setSurveyList(state, surveys: SurveyModel[] = []) {
      state.surveys = new Map<number, SurveyModel>(
        surveys.map((survey) => [survey.sid, survey])
      );
    },

    updateResponses(
      state,
      payload: { sid: number; responses: ResponseModel[] }
    ) {
      state.responses.set(payload.sid, payload.responses);
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

    async refreshResponses(
      state,
      sid: number
    ): Promise<ResponseModel[] | undefined> {
      if (state.state.limesurvey) {
        const responses = await state.state.limesurvey.getResponses(sid);
        if (typeof responses !== "undefined") {
          state.commit("updateResponses", {
            sid,
            responses,
          });
          return responses;
        }
      }
    },
  },
  modules: {},
});
