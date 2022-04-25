import { createStore } from "vuex";
import KoordStore from "@/store/koord.store";
import { LimesurveyApi } from "@/plugins";

export default createStore<KoordStore>({
  state: {
    surveys: [],
  },
  getters: {
    getSurveyList(state) {
      return state.surveys.map((survey) => survey.id);
    },
  },
  mutations: {
    async authenticate(state, payload: { username: string; password: string }) {
      const api = new LimesurveyApi();
      const okay = await api.authenticate(payload.username, payload.password);
      if (okay) {
        state.limesurvey = api;
      }
    },
  },
  actions: {},
  modules: {},
});
