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
  },
  modules: {},
});
