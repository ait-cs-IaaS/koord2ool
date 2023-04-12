import { LimesurveyApi } from "../plugins";
import KoordLayout from "./koord.layout";
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
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createPinia, defineStore, type Pinia } from 'pinia';

export const api = new LimesurveyApi();


/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export const koordStore = defineStore('koord', {
  state: (): KoordLayout => ({
    error: undefined,
    limesurvey: undefined,
    participants: {},
    responses: {},
    surveys: {},
    settings: { step: 6, onlyActive: true, useLogicalTime: false, expirationTime: 7 },
    responseRange: [0, new Date().getTime()],
    selectedSurveyID: undefined,
    syncing: false,
  }),
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

    instance: (state) => {
      const endpoint = import.meta.env.VITE_APP_LIMESURVEY_API;
      if (!/\/admin\/remotecontrol$/.test(endpoint)) {
        state.error = new Error(`LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something ending in "/admin/remotecontrol"`);
        return "";
      }
      if (endpoint === undefined) {
        state.error = new Error("LimeSurvey RPC endpoint unconfigured. Please set the VITE_APP_LIMESURVEY_API environment variable.");
        return "";
      }
      const domain = new URL(endpoint);
      if (domain.hostname === undefined) {
        state.error = new Error(`LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something like "https://example.com/admin/remotecontrol"`);
        return "";
      }
      return `${domain.protocol}//${domain.hostname}`;
    },
    getResponses: (state) => (sid: number) => {
      if (typeof state.responses[sid] === "undefined") {
        return [] as ResponseModel[];
      }
      return state.responses[sid];
    },
    getParticipants: (state) => (sid: number): ParticipantModel[] => {
      if (typeof state.participants[sid] === "undefined") {
        return [] as ParticipantModel[];
      }
      return state.participants[sid];
    },
    getSurvey: (state) => (sid: number) => {
      if (typeof state.surveys[sid] === "undefined") {
        return {} as SurveyModel;
      }
      return state.surveys[sid];
    },
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
      (sid: number | undefined = state.selectedSurveyID): Date => {
        if (sid === undefined || state.responses[sid] === undefined) {
          return new Date(0);
        }
        return minResponseDate(state.responses[sid]);
      },
    getMaxResponseDate:
      (state) =>
      (sid: number | undefined = state.selectedSurveyID): Date => {
        if (sid === undefined || state.responses[sid] === undefined) {
          return new Date();
        }
        return maxResponseDate(state.responses[sid]);
      },
    fromDate(state): Date {
      if (state.responseRange[0] === undefined) {
        return this.getMinResponseDate();
      }
      return new Date(state.responseRange[0]);
    },
    untilDate(state): Date {
      if (state.responseRange[1] === undefined) {
        return this.getMaxResponseDate();
      }
      return new Date(state.responseRange[1]);
    },
    getExpireDate(state): Date {
      return new Date(new Date().getTime() - state.settings.expirationTime * 24 * 60 * 60 * 1000);
    }
  },
  actions: {
    async authenticate(
      payload: { username: string; password: string }
    ): Promise<boolean> {
      const session = await api.authenticate(
        payload.username,
        payload.password
      );

      const okay = session !== undefined;

      if (okay) {
        this.setApi({ session, username: payload.username });
        await this.refreshSurveys();
      } else {
        this.error = new Error("Failed to authenticate");
      }

      return okay;
    },

    logout() {
      this.limesurvey = undefined;
      api.username = undefined;
      api.session = undefined;
    },

    setApi(apiSession: { session: string; username: string }) {
      api.username = apiSession.username;
      api.session = apiSession.session;
      this.limesurvey = apiSession;
    },

    async refreshSurvey(surveyId: number): Promise<void> {
      if (this.isAuthenticated) {
        this.selectedSurveyID = surveyId
        await Promise.all([
          this.refreshQuestions(surveyId),
          this.refreshResponses(surveyId),
          this.refreshParticipants(surveyId),
        ]);
      }
    },

    async refreshSurveys(): Promise<SurveyModel[]> {
      if (this.isAuthenticated) {
        const surveys = await api.listSurveys();
        this.setSurveyList(surveys);
        return surveys;
      }
      return [];
    },

    setSurveyList(surveys: SurveyModel[] = []) {
      const newSurveys: Record<number, SurveyModel> = {};
      for (const survey of surveys) {
        newSurveys[survey.sid] = {
          ...survey,
          ...(typeof this.surveys[survey.sid] !== "undefined"
            ? {
                details: this.surveys[survey.sid].details,
                questions: this.surveys[survey.sid].questions,
              }
            : {}),
        };
      }
      this.surveys = newSurveys;
    },

    async refreshQuestions(sid: number): Promise<QuestionModel[]> {
      if (this.limesurvey) {
        const questions = await api.getQuestions(sid);
        this.updateQuestions({ sid, questions });
        return questions;
      }
      return [];
    },

    async refreshQuestionProperties(qid: number): Promise<void> {
      if (this.limesurvey) {
        const question_properties = await api.getQuestionProperties(qid);
        this.updateQuestionProperties({ question_properties });
      }
    },

    async refreshResponses(sid: number): Promise<ResponseModel[]> {
      if (this.limesurvey) {
        const responses = await api.getResponses(sid);
        if (typeof responses !== "undefined") {
          this.responses[sid] = responses;
          return responses;
        }
      }
      return [];
    },

    async refreshParticipants(sid: number): Promise<ParticipantModel[]> {
      if (this.isAuthenticated) {
        const participants = await api.getParticipants(sid);
        this.participants[sid] = participants;
        return participants;
      }
      return [];
    },

    updateQuestionProperties(
      payload: { question_properties: QuestionPropertyModel }
    ) {
      const sid: number = +payload.question_properties.sid;
      const title: string = payload.question_properties.title;
      const questions = this.surveys[sid].questions;
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
      payload: { sid: number; questions: QuestionModel[] }
    ) {
      if (typeof this.surveys[payload.sid] !== "undefined") {
        const asRecord: Record<string, QuestionModel> = {};
        for (const question of payload.questions) {
          if (question.question_theme_name === "multipleshorttext") {
            this.refreshQuestionProperties(question.qid);
          }
          asRecord[question.title] = question;
        }
        this.surveys[payload.sid].questions = asRecord;
      } else {
        console.warn(
          `Survey ${payload.sid} not found in the store; can't update questions.`
        );
      }
    },
  },
  persist: {
    paths: ["limesurvey", "settings"],
  },
});
