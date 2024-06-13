import { LimesurveyApi } from "../api/limesurvey";
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
import { ref, computed } from "vue";
import { SettingsModel } from "../types/settings.model";

/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export const koordStore = defineStore(
  "koord",
  () => {
    const error = ref<Error | undefined>(undefined);
    const tokenMap = ref<Record<string, number>>({});
    const participants = ref<Record<number, ParticipantModel[]>>({});
    const responses = ref<Record<number, ResponseModel[]>>({});
    const questions = ref<Record<number, Record<string, QuestionModel>>>({});
    const surveys = ref<Record<number, SurveyModel>>({});
    const settings = ref<SettingsModel>({
      step: 6,
      onlyActive: true,
      timeFormat: "real",
      expirationTime: 7,
      displayNA: true,
    });
    const questionKeys = ref<string[]>([]);
    const responseRange = ref<number[]>([0, new Date().getTime()]);
    const selectedSurveyID = ref<number | undefined>(undefined);
    const limesurvey = ref<Record<string, string> | undefined>(undefined);
    const minMaxFromDataset = ref<Record<string, { min: number; max: number }>>(
      {},
    );
    const api = new LimesurveyApi();

    const getSurveys = computed(() =>
      Object.values(surveys.value).map((survey) => survey.sid),
    );
    const hasError = computed(() => typeof error.value !== "undefined");
    const isAuthenticated = computed(
      () =>
        typeof limesurvey.value !== "undefined" &&
        typeof limesurvey.value.username !== "undefined",
    );
    const username = computed(() =>
      typeof limesurvey.value !== "undefined"
        ? limesurvey.value.username
        : "User",
    );
    const instance = computed(() => {
      const endpoint = import.meta.env.VITE_APP_LIMESURVEY_API;
      if (!/\/admin\/remotecontrol$/.test(endpoint)) {
        error.value = new Error(
          `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something ending in "/admin/remotecontrol"`,
        );
        return "";
      }
      if (endpoint === undefined) {
        error.value = new Error(
          "LimeSurvey RPC endpoint unconfigured. Please set the VITE_APP_LIMESURVEY_API environment variable.",
        );
        return "";
      }
      const domain = new URL(endpoint);
      if (domain.hostname === undefined) {
        error.value = new Error(
          `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something like "https://example.com/admin/remotecontrol"`,
        );
        return "";
      }
      return `${domain.protocol}//${domain.hostname}`;
    });

    const getResponses = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return [] as ResponseModel[];
      }
      if (typeof responses.value[selectedSurveyID.value] === "undefined") {
        return [] as ResponseModel[];
      }
      return responses.value[selectedSurveyID.value];
    });

    const getParticipants = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return [] as ParticipantModel[];
      }
      if (typeof participants.value[selectedSurveyID.value] === "undefined") {
        return [] as ParticipantModel[];
      }
      return participants.value[selectedSurveyID.value];
    });

    const getQuestions = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return {} as Record<string, QuestionModel>;
      }
      return questions.value[selectedSurveyID.value] || {};
    });

    const getSurvey = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return {} as SurveyModel;
      }
      return surveys.value[selectedSurveyID.value];
    });

    const getSettings = computed(() => settings.value);
    const surveyLinks = computed(() => {
      const surveyIds: number[] = Object.keys(surveys.value).map(Number);
      return surveyIds.sort().map((surveyId) => {
        const title = surveys.value[surveyId].surveyls_title;
        return {
          key: surveyId,
          label: `${surveyId} - ${title}`,
          to: `/survey/${surveyId}`,
        };
      });
    });

    const questionCount = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return 0;
      }
      return Object.keys(questions.value[selectedSurveyID.value] || {}).length;
    });

    const submitDateMatch = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return false;
      }
      if (typeof responses.value[selectedSurveyID.value] === "undefined") {
        return false;
      }
      return hasSubmitDateMatch(responses.value[selectedSurveyID.value]);
    });

    const getMinResponseDate = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return new Date(0);
      }
      if (typeof responses.value[selectedSurveyID.value] === "undefined") {
        return new Date(0);
      }
      return minResponseDate(responses.value[selectedSurveyID.value]);
    });

    const getMaxResponseDate = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return new Date();
      }
      if (typeof responses.value[selectedSurveyID.value] === "undefined") {
        return new Date();
      }
      return maxResponseDate(responses.value[selectedSurveyID.value]);
    });

    const fromDate = computed(() => {
      if (responseRange.value[0] === undefined) {
        return getMinResponseDate.value;
      }
      return new Date(responseRange.value[0]);
    });

    const untilDate = computed(() => {
      if (responseRange.value[1] === undefined) {
        return getMaxResponseDate.value;
      }
      return new Date(responseRange.value[1]);
    });

    const getExpireDate = computed(() => {
      return new Date(
        new Date().getTime() -
          settings.value.expirationTime * 24 * 60 * 60 * 1000,
      );
    });

    const responsesInTimeline = computed(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return [] as ResponseModel[];
      }
      return getResponses.value.filter((response) => {
        const thisTime = new Date(response.submitdate);
        return fromDate.value <= thisTime && thisTime <= untilDate.value;
      });
    });

    function getQuestionType(qid: string) {
      const questions = getQuestions.value;
      const question = questions[qid];
      if (question === undefined) {
        return "";
      }
      return question.question_theme_name;
    }

    function updateSurveyList(rawSurveys: SurveyModel[] = []) {
      const newSurveys: Record<number, SurveyModel> = {};
      for (const survey of rawSurveys) {
        newSurveys[survey.sid] = {
          ...survey,
          ...(typeof surveys.value[survey.sid] !== "undefined"
            ? {
                details: surveys.value[survey.sid].details,
                questions: surveys.value[survey.sid].questions,
              }
            : {}),
        };
      }
      surveys.value = newSurveys;
    }

    async function refreshSurveys(): Promise<void> {
      const surveys = await api.listSurveys();
      updateSurveyList(surveys);
    }

    async function authenticate(payload: {
      username: string;
      password: string;
    }): Promise<boolean> {
      const session = await api.authenticate(
        payload.username,
        payload.password,
      );

      console.debug("Session: ", session);

      const okay = session !== undefined;

      if (okay) {
        setApi({ session, username: payload.username });
        await refreshSurveys();
      } else {
        error.value = new Error("Failed to authenticate");
      }

      return okay;
    }

    function logout() {
      limesurvey.value = undefined;
      api.username = undefined;
      api.session = undefined;
    }

    function setApi(apiSession: { session: string; username: string }) {
      api.username = apiSession.username;
      api.session = apiSession.session;
      limesurvey.value = apiSession;
    }

    async function refreshSurvey(surveyId: number): Promise<void> {
      if (!(surveyId in surveys.value)) {
        await refreshSurveys();
      }

      selectedSurveyID.value = surveyId;
      responseRange.value = [0, new Date().getTime()];
      await Promise.all([
        refreshQuestions(surveyId),
        refreshResponses(surveyId),
        refreshParticipants(surveyId).then(() => {
          updateTokenMap(surveyId);
        }),
      ]);
      updateQuestionKeys();
    }

    async function refreshQuestions(sid: number): Promise<QuestionModel[]> {
      if (limesurvey.value) {
        const questions = await api.getQuestions(sid);
        updateQuestions(sid, questions);
        return questions;
      }
      return [];
    }

    async function refreshQuestionProperties(qid: number): Promise<void> {
      if (limesurvey.value) {
        const question_properties = await api.getQuestionProperties(qid);
        updateQuestionProperties({ question_properties });
      }
    }

    async function refreshResponses(sid: number): Promise<void> {
      if (limesurvey.value) {
        responses.value[sid] = await api.getResponses(sid);
      }
    }

    async function refreshParticipants(sid: number): Promise<void> {
      if (isAuthenticated.value) {
        participants.value[sid] = await api.getParticipants(sid);
      }
    }

    function updateQuestionProperties(payload: {
      question_properties: QuestionPropertyModel;
    }) {
      const sid: number = +payload.question_properties.sid;
      const title: string = payload.question_properties.title;
      const { questions } = surveys.value[sid];
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

      if (
        payload.question_properties &&
        payload.question_properties.available_answers &&
        typeof payload.question_properties.available_answers === "object"
      ) {
        question.available_answers = Object.entries(
          payload.question_properties.available_answers,
        ).reduce(
          (acc, [key, value]) => {
            acc[`${payload.question_properties.title}[${key}]`] = value;
            return acc;
          },
          {} as { [key: string]: string },
        );
      }
    }

    function updateQuestions(sid: number, rawQuestions: QuestionModel[]) {
      if (typeof surveys.value[sid] !== "undefined") {
        const asRecord: Record<string, QuestionModel> = {};
        for (const question of rawQuestions) {
          if (
            question.question_theme_name === "multipleshorttext" ||
            question.question_theme_name === "multiplechoice"
          ) {
            refreshQuestionProperties(question.qid);
          }
          asRecord[question.title] = question;
        }
        questions.value[sid] = asRecord;
        surveys.value[sid].questions = asRecord;
      } else {
        console.warn(
          `Survey ${sid} not found in the store; can't update questions.`,
        );
      }
    }

    function updateQuestionKeys() {
      // if a question has a parent_id, I want to look at the question where qid is that id, and check if the
      // question_theme_name is multiplechoice or multipleshorttext and if yes ignore the question

      const parend_qids = Object.values(getQuestions.value).reduce(
        (acc, question) => {
          const key = question.qid;
          acc[key] = question.question_theme_name ?? "";
          return acc;
        },
        {} as Record<string, string>,
      );

      for (const question of Object.values(getQuestions.value)) {
        if (question.parent_qid !== 0 && question.parent_qid !== undefined) {
          if (
            parend_qids[question.parent_qid] === "multiplechoice" ||
            parend_qids[question.parent_qid] === "multipleshorttext"
          ) {
            continue;
          }
        }
        questionKeys.value.push(question.title);
      }
    }

    function updateTokenMap(sid: number) {
      if (!responses.value[sid]) {
        return;
      }
      const tokens: string[] = [];
      responses.value[sid].forEach((response) => {
        const token =
          participants.value[sid]?.find(
            (participant) => participant.id === response.token,
          )?.token ?? response.token;
        if (!tokens.includes(token)) {
          tokens.push(token);
        }
      });
      tokens.forEach((token, index) => {
        tokenMap.value[token] = index;
      });
    }

    function setMinMax(
      minMax: { min: number; max: number },
      questionKey: string,
    ) {
      minMaxFromDataset.value[questionKey] = minMax;
    }

    function reset() {
      participants.value = {};
      responses.value = {};
      questions.value = {};
      surveys.value = {};
      tokenMap.value = {};
      minMaxFromDataset.value = {};
    }

    return {
      error,
      tokenMap,
      participants,
      responses,
      questions,
      surveys,
      settings,
      responseRange,
      selectedSurveyID,
      limesurvey,
      api,
      getSurveys,
      hasError,
      isAuthenticated,
      username,
      instance,
      getResponses,
      getParticipants,
      getQuestions,
      getSurvey,
      getSettings,
      surveyLinks,
      questionCount,
      submitDateMatch,
      getMinResponseDate,
      getMaxResponseDate,
      fromDate,
      untilDate,
      questionKeys,
      getExpireDate,
      minMaxFromDataset,
      responsesInTimeline,
      setMinMax,
      getQuestionType,
      authenticate,
      updateSurveyList,
      logout,
      setApi,
      refreshSurvey,
      refreshSurveys,
      refreshQuestions,
      refreshQuestionProperties,
      refreshResponses,
      refreshParticipants,
      updateQuestions,
      updateQuestionKeys,
      updateTokenMap,
      reset,
    };
  },
  {
    persist: {
      paths: ["limesurvey", "settings"],
    },
  },
);
