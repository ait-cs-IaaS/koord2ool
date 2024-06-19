import { LimesurveyApi } from "../api/limesurvey";
import { SurveyModel } from "../types/survey.model";
import { ResponseModel, FilteredResponse } from "../types/response.model";
import { hasSubmitDateMatch, minResponseDate, maxResponseDate, responseMapper, multipleChoiceResponseMapper } from "../helpers/response";
import { QuestionModel } from "../types/question.model";
import { QuestionPropertyModel } from "../types/question_property.model";
import { ParticipantModel } from "../types/participant.model";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createPinia, defineStore, type Pinia } from "pinia";
import { ref, computed } from "vue";
import { SettingsModel } from "../types/settings.model";
import { isMultipleChoiceQuestion } from "../helpers/questionMapping";

/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export const useSurveyStore = defineStore(
  "surveyStore",
  () => {
    const api = new LimesurveyApi();

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
    const minMaxFromDataset = ref<Record<string, { min: number; max: number }>>({});

    const getSurveys = computed<number[]>(() => Object.values(surveys.value).map((survey) => survey.sid));

    const getResponses = computed<ResponseModel[]>(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return [] as ResponseModel[];
      }
      if (typeof responses.value[selectedSurveyID.value] === "undefined") {
        return [] as ResponseModel[];
      }
      return responses.value[selectedSurveyID.value];
    });

    const getParticipants = computed<ParticipantModel[]>(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return [] as ParticipantModel[];
      }
      if (typeof participants.value[selectedSurveyID.value] === "undefined") {
        return [] as ParticipantModel[];
      }
      return participants.value[selectedSurveyID.value];
    });

    const getQuestions = computed<Record<string, QuestionModel>>(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return {};
      }
      return questions.value[selectedSurveyID.value] || {};
    });

    const getSurvey = computed<SurveyModel>(() => {
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

    const getMaxResponseDate = computed<Date>(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return new Date();
      }
      if (typeof responses.value[selectedSurveyID.value] === "undefined") {
        return new Date();
      }
      return maxResponseDate(responses.value[selectedSurveyID.value]);
    });

    const fromDate = computed<Date>(() => {
      if (responseRange.value[0] === undefined || responseRange.value[0] === 0) {
        return getMinResponseDate.value;
      }
      return new Date(responseRange.value[0]);
    });

    const untilDate = computed<Date>(() => {
      if (responseRange.value[1] === undefined) {
        return getMaxResponseDate.value;
      }
      return new Date(responseRange.value[1]);
    });

    const getExpireDate = computed<Date>(() => {
      return new Date(new Date().getTime() - settings.value.expirationTime * 24 * 60 * 60 * 1000);
    });

    const responsesInTimeline = computed<ResponseModel[]>(() => {
      if (typeof selectedSurveyID.value === "undefined") {
        return [] as ResponseModel[];
      }
      return getResponses.value.filter((response) => {
        const thisTime = new Date(response.submitdate);
        return fromDate.value <= thisTime && thisTime <= untilDate.value;
      });
    });

    function getFilteredResponses(qid: string): FilteredResponse[] {
      return responsesInTimeline.value
        .map((response) => {
          if (isMultipleChoiceQuestion(getQuestionType(qid))) {
            const { available_answers } = getQuestions.value[qid];
            return multipleChoiceResponseMapper(available_answers || qid, response);
          }
          return responseMapper(qid, response);
        })
        .sort((a, b) => a.time.valueOf() - b.time.valueOf());
    }

    function getQuestionType(qid: string): string {
      const questions = getQuestions.value;
      const question = questions[qid];
      if (question === undefined || question.question_theme_name === undefined) {
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

    async function refreshSurvey(surveyId: number): Promise<void> {
      if (!(surveyId in surveys.value)) {
        await refreshSurveys();
      }

      resetSurvey();
      selectedSurveyID.value = surveyId;
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
      const questions = await api.getQuestions(sid);
      updateQuestions(sid, questions);
      return questions;
    }

    async function refreshQuestionProperties(qid: number): Promise<void> {
      const question_properties = await api.getQuestionProperties(qid);
      updateQuestionProperties({ question_properties });
    }

    async function refreshResponses(sid: number): Promise<void> {
      responses.value[sid] = await api.getResponses(sid);
      responseRange.value[1] = maxResponseDate(responses.value[sid]).getTime();
    }

    async function refreshParticipants(sid: number): Promise<void> {
      participants.value[sid] = await api.getParticipants(sid);
    }

    function updateQuestionProperties(payload: { question_properties: QuestionPropertyModel }) {
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
      if (typeof payload.question_properties.subquestions === "string" || payload.question_properties.subquestions === undefined) {
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
        question.available_answers = Object.entries(payload.question_properties.available_answers).reduce(
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
          if (question.question_theme_name && isMultipleChoiceQuestion(question.question_theme_name)) {
            refreshQuestionProperties(question.qid);
          }
          asRecord[question.title] = question;
        }
        questions.value[sid] = asRecord;
        surveys.value[sid].questions = asRecord;
      } else {
        console.warn(`Survey ${sid} not found in the store; can't update questions.`);
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
          if (parend_qids[question.parent_qid] === "multiplechoice" || parend_qids[question.parent_qid] === "multipleshorttext") {
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
        const token = participants.value[sid]?.find((participant) => participant.id === response.token)?.token ?? response.token;
        if (!tokens.includes(token)) {
          tokens.push(token);
        }
      });
      tokens.forEach((token, index) => {
        tokenMap.value[token] = index;
      });
    }

    function setMinMax(minMax: { min: number; max: number }, questionKey: string) {
      minMaxFromDataset.value[questionKey] = minMax;
    }

    function resetSurvey() {
      tokenMap.value = {};
      responseRange.value = [0, new Date().getTime()];
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
      tokenMap,
      participants,
      responses,
      questions,
      surveys,
      settings,
      responseRange,
      selectedSurveyID,
      api,
      getSurveys,
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
      getFilteredResponses,
      updateSurveyList,
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
      paths: ["settings", "surveys"],
    },
  },
);
