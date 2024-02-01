import { LimesurveyApi } from "../api/limesurvey";
import { KoordLayout } from "./koord.layout";
import { SurveyModel } from "../types/survey.model";
import { ResponseModel } from "../types/response.model";
import {
  hasSubmitDateMatch,
  minResponseDate,
  maxResponseDate,
} from "../helpers/response";
import { QuestionModel } from "../types/question.model";
import { QuestionPropertyModel } from "../types/question_property.model";
import { ParticipantModel } from "../types/participant.model";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createPinia, defineStore, type Pinia } from "pinia";

/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export const koordStore = defineStore("koord", {
  state: (): KoordLayout => ({
    error: undefined,
    limesurvey: undefined,
    participants: {},
    responses: {},
    questions: {},
    surveys: {},
    settings: {
      step: 6,
      onlyActive: true,
      useLogicalTime: false,
      expirationTime: 7,
      displayNA: true,
      useAPEX: false,
    },
    responseRange: [0, new Date().getTime()],
    selectedSurveyID: undefined,
    api: new LimesurveyApi(),
    tokenMap: {},
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
        state.error = new Error(
          `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something ending in "/admin/remotecontrol"`
        );
        return "";
      }
      if (endpoint === undefined) {
        state.error = new Error(
          "LimeSurvey RPC endpoint unconfigured. Please set the VITE_APP_LIMESURVEY_API environment variable."
        );
        return "";
      }
      const domain = new URL(endpoint);
      if (domain.hostname === undefined) {
        state.error = new Error(
          `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something like "https://example.com/admin/remotecontrol"`
        );
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
    getParticipants:
      (state) =>
      (sid: number): ParticipantModel[] => {
        if (typeof state.participants[sid] === "undefined") {
          return [] as ParticipantModel[];
        }
        return state.participants[sid];
      },
    getQuestions:
      (state) =>
      (sid: number): Record<string, QuestionModel> => {
        return state.questions[sid] || {};
      },
    getQuestionType: () => (sid: number, qid: string) => {
      const store = koordStore();
      const questions = store.getQuestions(sid);
      const question = questions[qid];
      if (question === undefined) {
        return "";
      }
      return question.question_theme_name;
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
      return new Date(
        new Date().getTime() -
          state.settings.expirationTime * 24 * 60 * 60 * 1000
      );
    },
    responsesInTimeline:
      (state) =>
      (sid: number | undefined = state.selectedSurveyID): ResponseModel[] => {
        if (sid === undefined) {
          return [];
        }
        const store = koordStore();
        return store.getResponses(sid).filter((response) => {
          const thisTime = new Date(response.submitdate);
          return store.fromDate <= thisTime && thisTime <= store.untilDate;
        });
      },
  },
  actions: {
    async authenticate(payload: {
      username: string;
      password: string;
    }): Promise<boolean> {
      const session = await this.api.authenticate(
        payload.username,
        payload.password
      );

      console.debug("Session: ", session);

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
      this.api.username = undefined;
      this.api.session = undefined;
    },

    setApi(apiSession: { session: string; username: string }) {
      this.api.username = apiSession.username;
      this.api.session = apiSession.session;
      this.limesurvey = apiSession;
    },

    async refreshSurvey(surveyId: number): Promise<void> {
      if (this.isAuthenticated) {
        this.selectedSurveyID = surveyId;
        await Promise.all([
          this.refreshQuestions(surveyId),
          this.refreshResponses(surveyId),
          this.refreshParticipants(surveyId).then(() => {
            this.updateTokenMap(surveyId);
          }),
        ]);
      }
    },

    async refreshSurveys(): Promise<SurveyModel[]> {
      if (this.isAuthenticated) {
        const surveys = await this.api.listSurveys();
        this.updateSurveyList(surveys);
        return surveys;
      }
      return [];
    },

    async refreshQuestions(sid: number): Promise<QuestionModel[]> {
      if (this.limesurvey) {
        const questions = await this.api.getQuestions(sid);
        this.updateQuestions(sid, questions);
        return questions;
      }
      return [];
    },

    async refreshQuestionProperties(qid: number): Promise<void> {
      if (this.limesurvey) {
        const question_properties = await this.api.getQuestionProperties(qid);
        this.updateQuestionProperties({ question_properties });
      }
    },

    async refreshResponses(sid: number): Promise<ResponseModel[]> {
      if (this.limesurvey) {
        const responses = await this.api.getResponses(sid);
        if (typeof responses !== "undefined") {
          this.responses[sid] = responses;
          return responses;
        }
      }
      return [];
    },

    async refreshParticipants(sid: number): Promise<ParticipantModel[]> {
      if (this.isAuthenticated) {
        const participants = await this.api.getParticipants(sid);
        this.participants[sid] = participants;
        return participants;
      }
      return [];
    },

    updateSurveyList(surveys: SurveyModel[] = []) {
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

    updateQuestionProperties(payload: {
      question_properties: QuestionPropertyModel;
    }) {
      const sid: number = +payload.question_properties.sid;
      const title: string = payload.question_properties.title;
      const { questions } = this.surveys[sid];
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
      const { subquestions } = payload.question_properties;
      const result = Object.keys(subquestions).reduce((acc, key) => {
        const titleX = subquestions[key].title;
        const questionX = subquestions[key].question;
        return { ...acc, [titleX]: questionX };
      }, {});
      question.subquestions = result;
    },

    updateQuestions(sid: number, questions: QuestionModel[]) {
      if (typeof this.surveys[sid] !== "undefined") {
        const asRecord: Record<string, QuestionModel> = {};
        for (const question of questions) {
          if (question.question_theme_name === "multipleshorttext") {
            this.refreshQuestionProperties(question.qid);
          }
          asRecord[question.title] = question;
        }
        this.questions[sid] = asRecord;
        this.surveys[sid].questions = asRecord;
      } else {
        console.warn(
          `Survey ${sid} not found in the store; can't update questions.`
        );
      }
    },
    updateTokenMap(sid: number) {
      if (!this.responses[sid]) {
        return;
      }
      const tokens: string[] = [];
      this.responses[sid].forEach((response) => {
        const token =
          this.participants[sid]?.find(
            (participant) => participant.id === response.token
          )?.token ?? response.token;
        if (!tokens.includes(token)) {
          tokens.push(token);
        }
      });
      tokens.forEach((token, index) => {
        this.tokenMap[token] = index;
      });
    },
    reset() {
      this.participants = {};
      this.responses = {};
      this.questions = {};
      this.surveys = {};
    },
  },
  persist: {
    paths: ["limesurvey", "settings"],
  },
});
