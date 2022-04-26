import { createStore } from "vuex";
import KoordStore from "@/store/koord.store";
import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";

export default createStore<KoordStore>({
  state: {
    surveys: [],
  },
  getters: {
    getSurveyCount: (state) => state.surveys.length,
  },
  mutations: {
    setApi(state, api?: LimesurveyApi) {
      state.limesurvey = api;
    },

    setSurveyList(state, surveys: SurveyModel[] = []) {
      // TODO: elaborate merging?
      state.surveys = surveys;
    },

    updateSurvey(state, payload: SurveyModel) {
      if (!state.surveys[payload.sid]) {
        throw new Error("Survey not found");
      }

      state.surveys[payload.sid].details = payload;
    },
  },
  actions: {
    async authenticate(state, payload: { username: string; password: string }) {
      const api = new LimesurveyApi();
      const okay = await api.authenticate(payload.username, payload.password);
      console.debug("Authenticated with LimeSurvey", okay);

      if (okay) {
        state.commit("setApi", okay ? api : undefined);
        state.dispatch("refreshSurveys");
      }
    },

    async refreshSurveys(state) {
      if (state.state.limesurvey) {
        state.commit(
          "setSurveyList",
          await state.state.limesurvey.listSurveys()
        );
      }
    },

    async refreshSurvey(state, sid: number) {
      if (state.state.limesurvey) {
        state.commit(
          "updateSurvey",
          await state.state.limesurvey.getSurvey(sid)
        );
      }
    },
  },
  modules: {},
});
