import Vue from "vue";
import Vuex from "vuex";
import RememberAuthPlugin from "@/store/remember-auth.plugin";
import KoordLayout from "@/store/koord.layout";
import { LimesurveyApi } from "@/plugins";
import SurveyModel from "@/store/survey.model";
import ResponseModel from "@/store/response.model";
import QuestionModel from "@/store/question.model";
import { ParticipantModel } from "@/store/participant.model";

Vue.use(Vuex);

const store = new Vuex.Store<KoordLayout>({
  state: {
    error: undefined,
    limesurvey: undefined,
    participants: {},
    responses: {},
    surveys: {},
    settings: { step: 6, limeSurveyUri: process.env.VUE_APP_LIMESURVEY_API },
    syncing: false,
  },
  getters: {
    getSurveys: (state) => Object.keys(state.surveys).map((key) => Number(key)),

    hasError: (state) => typeof state.error !== "undefined",

    isAuthenticated: (state) =>
      typeof state.limesurvey !== "undefined" &&
      typeof state.limesurvey.username !== "undefined",

    username: (state) =>
      typeof state.limesurvey !== "undefined" ? state.limesurvey.username : "",

    getInstanceDomain: (state) => {
      const endpoint = state.settings.limeSurveyUri;
      if (!/\/admin\/remotecontrol$/.test(endpoint)) {
        store.commit(
          "setError",
          `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something ending in "/admin/remotecontrol"`
        );
        return "";
      }
      if (state.settings.limeSurveyUri === undefined) {
        store.commit(
          "setError",
          "LimeSurvey RPC endpoint unconfigured. Please set the VUE_APP_LIMESURVEY_API environment variable."
        );
        return "";
      }
      const domain = new URL(state.settings.limeSurveyUri);
      if (domain.hostname === undefined) {
        store.commit(
          "setError",
          `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something like "https://example.com/admin/remotecontrol"`
        );
        return "";
      }
      return domain.hostname;
    },
    getResponses: (state) => (sid: number) => {
      if (typeof state.responses[sid] === "undefined") {
        return [];
      }
      return state.responses[sid];
    },
    getParticipants: (state) => (sid: number) => {
      if (typeof state.participants[sid] === "undefined") {
        return [];
      }
      return state.participants[sid];
    },
  },
  mutations: {
    setApi(state, api?: LimesurveyApi) {
      state.limesurvey = api;
    },

    setError(state, error?: Error) {
      state.error = error;
    },

    setSyncState(state, syncing = true) {
      state.syncing = syncing;
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

    updateParticipants(
      state,
      payload: { sid: number; participants: ParticipantModel[] }
    ) {
      Vue.set(state.participants, payload.sid, payload.participants);
    },
  },
  actions: {
    async authenticate(
      state,
      payload: { username: string; password: string }
    ): Promise<boolean> {
      state.commit("setSyncState", true);

      const api = new LimesurveyApi();
      const okay = await api.authenticate(payload.username, payload.password);

      if (okay) {
        state.commit("setApi", okay ? api : undefined);
        await state.dispatch("refreshSurveys");
      } else {
        state.commit("setError", new Error("Failed to authenticate"));
      }

      state.commit("setSyncState", false);
      return okay;
    },

    async refreshSurvey(state, surveyId: number): Promise<void> {
      if (state.state.limesurvey) {
        try {
          state.commit("setSyncState", true);
          await Promise.all([
            state.dispatch("refreshQuestions", surveyId),
            state.dispatch("refreshResponses", surveyId),
            state.dispatch("refreshParticipants", surveyId),
          ]);
        } finally {
          state.commit("setSyncState", false);
        }
      }
    },

    async refreshSurveys(state): Promise<SurveyModel[]> {
      if (state.state.limesurvey) {
        const surveys = await state.state.limesurvey.listSurveys();
        state.commit("setSurveyList", surveys);
        return surveys;
      }
      return [];
    },

    async refreshQuestions(state, sid: number): Promise<QuestionModel[]> {
      if (state.state.limesurvey) {
        const questions = await state.state.limesurvey.getQuestions(sid);
        state.commit("updateQuestions", { sid, questions });
        return questions;
      }
      return [];
    },

    async refreshResponses(state, sid: number): Promise<ResponseModel[]> {
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
      return [];
    },

    async refreshParticipants(state, sid: number): Promise<ParticipantModel[]> {
      if (state.state.limesurvey) {
        const participants = await state.state.limesurvey.getParticipants(sid);
        if (typeof participants !== "undefined") {
          state.commit("updateParticipants", {
            sid,
            participants,
          });
          return participants;
        }
      }
      return [];
    },
  },
  plugins: [RememberAuthPlugin],
});

export default store;

Vue.config.errorHandler = function (err, vm, info) {
  store.commit("setError", err);

  console.error(err);
  console.error(`Further info: ${info}`);
};
