import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import KoordLayout from "./koord.layout";
import { LimesurveyApi } from "../plugins";
import SurveyModel from "./survey.model";
import {
  ResponseModel,
  hasSubmitDateMatch,
  minResponseDate,
  maxResponseDate,
} from "./response.model";
import { QuestionModel } from "./question.model";
import QuestionPropertyModel from "./question_property.model";
import { ParticipantModel } from "./participant.model";

export const api = new LimesurveyApi();

const vuexLocal = new VuexPersistence<KoordLayout>({
  reducer: (state) => ({
    participants: state.participants,
    responses: state.responses,
    surveys: state.surveys,
    limesurvey: state.limesurvey,
  }),
  storage: window.localStorage,
});

const store = new Vuex.Store<KoordLayout>({
  state: {
    error: undefined,
    limesurvey: undefined,
    participants: {},
    responses: {},
    surveys: {},
    settings: { step: 6, limeSurveyUri: import.meta.env.VITE_APP_LIMESURVEY_API },
    selectedSurveyID: undefined,
    syncing: false,
  },
  getters: {
    getSurveys: (state) =>
      Object.values(state.surveys).map((survey) => survey.sid),

    hasError: (state) => typeof state.error !== "undefined",

    isAuthenticated: (state) =>
      typeof state.limesurvey !== "undefined" &&
      typeof state.limesurvey.username !== "undefined",

    username: (state) =>
      typeof state.limesurvey !== "undefined"
        ? state.limesurvey.username
        : "User",

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
          "LimeSurvey RPC endpoint unconfigured. Please set the VITE_APP_LIMESURVEY_API environment variable."
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
      return `${domain.protocol}//${domain.hostname}`;
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
    getSurvey: (state) => (sid: number) => {
      if (typeof state.surveys[sid] === "undefined") {
        return {};
      }
      return state.surveys[sid];
    },
    getStep: (state) => state.settings.step,
    getLimeSurveyUri: (state) => state.settings.limeSurveyUri,
    getSelectedSurveyID: (state) => state.selectedSurveyID,
    hasSubmitDateMatch:
      (state) =>
      (sid: number | undefined = state.selectedSurveyID) => {
        if (sid === undefined) {
          return false;
        }
        if (state.responses[sid] === undefined) {
          return false;
        }
        return hasSubmitDateMatch(state.responses[sid]);
      },
    getMinResponseDate:
      (state) =>
      (sid: number | undefined = state.selectedSurveyID) => {
        if (sid === undefined) {
          return undefined;
        }
        return minResponseDate(state.responses[sid]) as Date;
      },
    getMaxResponseDate:
      (state) =>
      (sid: number | undefined = state.selectedSurveyID) => {
        if (sid === undefined) {
          return undefined;
        }
        return maxResponseDate(state.responses[sid]);
      },
  },
  mutations: {
    setApi(state, apiSession: { session: string; username: string }) {
      api.username = apiSession.username;
      api.session = apiSession.session;
      state.limesurvey = apiSession;
    },

    setError(state, error?: Error) {
      state.error = error;
    },

    setSyncState(state, syncing = true) {
      state.syncing = syncing;
    },

    setSurveyID(state, sid: number) {
      state.selectedSurveyID = sid;
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
      state.surveys = newSurveys;
    },

    updateQuestionProperties(
      state,
      payload: { question_properties: QuestionPropertyModel }
    ) {
      const sid: number = +payload.question_properties.sid;
      const title: string = payload.question_properties.title;
      const questions = state.surveys[sid].questions;
      if (questions === undefined) {
        console.debug("No questions for survey: ", sid);
        return;
      }
      const question = questions[title];
      if (question === undefined) {
        console.debug("No question for title: ", title);
        return;
      }
      if (
        typeof payload.question_properties.subquestions === "string" ||
        payload.question_properties.subquestions === undefined
      ) {
        return;
      }
      const subquestions = payload.question_properties.subquestions;
      const result = Object.keys(subquestions).reduce((acc, key) => {
        const titleX = subquestions[key].title;
        const questionX = subquestions[key].question;
        return { ...acc, [titleX]: questionX };
      }, {});
      question.subquestions = result;
    },

    updateQuestions(
      state,
      payload: { sid: number; questions: QuestionModel[] }
    ) {
      if (typeof state.surveys[payload.sid] !== "undefined") {
        const asRecord: Record<string, QuestionModel> = {};
        for (const question of payload.questions) {
          if (question.question_theme_name === "multipleshorttext") {
            store.dispatch("refreshQuestionProperties", question.qid);
          }
          asRecord[question.title] = question;
        }
        state.surveys[payload.sid].questions = asRecord;
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
      state.responses[payload.sid] = payload.responses;
    },

    updateParticipants(
      state,
      payload: { sid: number; participants: ParticipantModel[] }
    ) {
      state.participants = payload.participants;
    },

    updateStep(state, step: number) {
      state.settings.step = step;
    },
  },
  actions: {
    async authenticate(
      state,
      payload: { username: string; password: string }
    ): Promise<boolean> {
      state.commit("setSyncState", true);

      const session = await api.authenticate(
        payload.username,
        payload.password
      );

      const okay = session !== undefined;

      if (okay) {
        state.commit("setApi", {
          session: session,
          username: payload.username,
        });
        await state.dispatch("refreshSurveys");
      } else {
        state.commit("setError", new Error("Failed to authenticate"));
      }

      state.commit("setSyncState", false);
      return okay;
    },

    async refreshSurvey(state, surveyId: number): Promise<void> {
      if (state.getters.isAuthenticated) {
        try {
          state.commit("setSyncState", true);
          state.commit("setSurveyID", surveyId);
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
      if (state.getters.isAuthenticated) {
        const surveys = await api.listSurveys();
        state.commit("setSurveyList", surveys);
        return surveys;
      }
      return [];
    },

    async refreshQuestions(
      { state, commit },
      sid: number
    ): Promise<QuestionModel[]> {
      if (state.limesurvey) {
        const questions = await api.getQuestions(sid);
        commit("updateQuestions", { sid, questions });
        return questions;
      }
      return [];
    },

    async refreshQuestionProperties(
      { state, commit },
      qid: number
    ): Promise<void> {
      if (state.limesurvey) {
        const question_properties = await api.getQuestionProperties(qid);
        commit("updateQuestionProperties", { question_properties });
      }
    },

    async refreshResponses(
      { state, commit },
      sid: number
    ): Promise<ResponseModel[]> {
      if (state.limesurvey) {
        const responses = await api.getResponses(sid);
        if (typeof responses !== "undefined") {
          commit("updateResponses", {
            sid,
            responses,
          });
          return responses;
        }
      }
      return [];
    },

    async refreshParticipants(state, sid: number): Promise<ParticipantModel[]> {
      if (state.getters.isAuthenticated) {
        const participants = await api.getParticipants(sid);
        state.commit("updateParticipants", {
          sid,
          participants,
        });
        return participants;
      }
      return [];
    },
  },
  plugins: [vuexLocal.plugin],
});

export default store;
