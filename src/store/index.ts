import Vue from "vue";
import Vuex from "vuex";
import KoordStore from "@/store/koord.store";
import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";
import QuestionModel from "@/store/question.model";

Vue.use(Vuex);

export default new Vuex.Store<KoordStore>({
  state: {
    limesurvey: undefined,
    responses: {},
    surveys: {},
  },
  getters: {
    getSurveys: (state) => Object.keys(state.surveys).map((key) => Number(key)),

    isAuthenticated: (state) =>
      typeof state.limesurvey !== "undefined" &&
      typeof state.limesurvey.username !== "undefined",

    username: (state) =>
      typeof state.limesurvey !== "undefined" ? state.limesurvey.username : "",
  },
  mutations: {
    setApi(state, api?: LimesurveyApi) {
      state.limesurvey = api;
    },

    setSurveyList(state, surveys: SurveyModel[] = []) {
      const newSurveys: Record<number, SurveyModel> = {};
      for (const survey of surveys) {
        newSurveys[survey.sid] = {
          ...survey,
          ...(typeof state.surveys[survey.sid] !== "undefined"
            ? {
                details: state.surveys[survey.sid].details,
                questions: state.surveys[survey.sid].questions,
              }
            : {}),
        };
      }
      Vue.set(state, "surveys", newSurveys);
    },

    updateQuestions(
      state,
      payload: { sid: number; questions: QuestionModel[] }
    ) {
      if (typeof state.surveys[payload.sid] !== "undefined") {
        const asRecord: Record<string, QuestionModel> = {};
        for (const question of payload.questions) {
          asRecord[question.title] = question;
        }
        Vue.set(state.surveys[payload.sid], "questions", asRecord);
      } else {
        console.warn(
          `Survey ${payload.sid} not found in the store; can't update questions.`
        );
      }
    },

    updateResponses(
      state,
      payload: { sid: number; responses: ResponseModel[] }
    ) {
      Vue.set(state.responses, payload.sid, payload.responses);
    },
  },
  actions: {
    async authenticate(
      state,
      payload: { username: string; password: string }
    ): Promise<boolean> {
      console.debug(`Authenticating as ${payload.username}`);
      const api = new LimesurveyApi();
      const okay = await api.authenticate(payload.username, payload.password);
      console.debug(`Authentication result: ${okay}`);

      if (okay) {
        state.commit("setApi", okay ? api : undefined);
        await state.dispatch("refreshSurveys");
        return true;
      }

      return false;
    },

    async refreshSurveys(state): Promise<SurveyModel[]> {
      if (state.state.limesurvey) {
        console.debug("Refreshing surveys");
        const surveys = await state.state.limesurvey.listSurveys();
        state.commit("setSurveyList", surveys);
        await Promise.all([
          ...surveys.map(({ sid }) => state.dispatch("refreshQuestions", sid)),
          ...surveys.map(({ sid }) => state.dispatch("refreshResponses", sid)),
        ]);
        return surveys;
      }
      return [];
    },

    async refreshQuestions(state, sid: number): Promise<QuestionModel[]> {
      if (state.state.limesurvey) {
        console.debug(`Refreshing questions for ${sid}`);
        const questions = await state.state.limesurvey.getQuestions(sid);
        state.commit("updateQuestions", { sid, questions });
        return questions;
      }
      return [];
    },

    async refreshResponses(state, sid: number): Promise<ResponseModel[]> {
      if (state.state.limesurvey) {
        console.debug(`Refreshing responses for ${sid}`);
        const responses = await state.state.limesurvey.getResponses(sid);
        if (typeof responses !== "undefined") {
          state.commit("updateResponses", {
            sid,
            responses,
          });
          return responses;
        }
      }
      return [];
    },
  },
  modules: {},
});
