import { LimesurveyApi } from "../api/limesurvey";
import { expect, describe, it, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import {
  authResponse,
  surveyListResponse,
  surveyPropertiesResponse,
  questionListResponse,
  expiredSessionResponse,
  export_responsesResponse,
  listParticiepantsResponse,
  questionListResponseInvalid,
} from "../testData/chartFunctionsTestData";

vi.mock("axios");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mockAxios = axios as Vi.Mocked<typeof axios>;

interface LimeSurveyRequest {
  method: string;
  id?: string | number;
  params?: string[] | number[];
  statusText: "OK";
}

function createMockAxiosResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: "OK",
    headers: {},
    config: {
      headers: {},
    } as InternalAxiosRequestConfig,
  };
}

describe("testLimesurveyApiInit", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  it("should throw an error if no endpoint is configured", () => {
    expect(() => {
      const api = new LimesurveyApi("");
      console.debug(api);
    }).toThrowError("LimeSurvey API endpoint not configured");
  });
  it("should return an instance of LimesurveyApi", () => {
    const api = new LimesurveyApi("http://localhost:8080/index.php/admin/remotecontrol");
    expect(api).toBeInstanceOf(LimesurveyApi);
  });
});

describe("testLimesurveyAuthenticate", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockAxios.post.mockResolvedValue({
      data: authResponse,
      status: 200,
    });
  });
  it("Should throw an error if no username is provided", async () => {
    const api = new LimesurveyApi("http://localhost:8080/index.php/admin/remotecontrol");
    await expect(api.authenticate("", "password")).rejects.toThrowError("LimeSurvey API username or password not configured");
  });
  it("Return Session Token", async () => {
    const api = new LimesurveyApi("http://localhost:8080/index.php/admin/remotecontrol");
    await expect(api.authenticate("user", "password")).resolves.toEqual("rApXJtkTOK_ovHUyH2J3ZkZrghgMfqJK");
  });
});

describe("testUnsucessfulAuthenticate", () => {
  let api: LimesurveyApi;

  beforeEach(() => {
    setActivePinia(createPinia());
    api = new LimesurveyApi("http://localhost:8080/index.php/admin/remotecontrol");
    api.setSession("1234", "user");
    mockAxios.post.mockImplementation((url: string, data?: LimeSurveyRequest): Promise<AxiosResponse> => {
      const body = data as LimeSurveyRequest;

      if (body.method == "get_session_key") {
        return Promise.resolve(createMockAxiosResponse(expiredSessionResponse));
      }
      return Promise.resolve(createMockAxiosResponse({ error: "TEST FAILED" }));
    });
  });
  it("Should redirect to login if session key is expired", async () => {
    const surveys = await api.listSurveys();
    expect(surveys).toEqual([]);
  });
});

describe("testLimesurveyAPI", () => {
  let api: LimesurveyApi;
  beforeEach(() => {
    setActivePinia(createPinia());
    api = new LimesurveyApi("http://localhost:8080/index.php/admin/remotecontrol");
    api.setSession("1234", "user");
    mockAxios.post.mockImplementation((url: string, data?: LimeSurveyRequest): Promise<AxiosResponse> => {
      const body = data as LimeSurveyRequest;

      switch (body.method) {
        case "get_session_key":
          return Promise.resolve(createMockAxiosResponse(authResponse));
        case "list_surveys":
          return Promise.resolve(createMockAxiosResponse(surveyListResponse));
        case "get_survey_properties":
          return Promise.resolve(createMockAxiosResponse(surveyPropertiesResponse));
        case "export_responses":
          return Promise.resolve(createMockAxiosResponse(export_responsesResponse));
        case "list_questions":
          if (!body.params) {
            return Promise.resolve(createMockAxiosResponse(expiredSessionResponse));
          }
          if (body.params[1] === 123456) {
            return Promise.resolve(createMockAxiosResponse(questionListResponse));
          }
          if (body.params[1] === 123457) {
            return Promise.resolve(createMockAxiosResponse(questionListResponseInvalid));
          }
        case "get_question_properties":
          return Promise.resolve(createMockAxiosResponse({}));
        case "list_participants":
          return Promise.resolve(createMockAxiosResponse(listParticiepantsResponse));
        default:
          return Promise.resolve(createMockAxiosResponse(expiredSessionResponse));
      }
    });
  });
  it("Return Survey List", async () => {
    const surveys = await api.listSurveys();
    expect(surveys).toEqual(surveyListResponse.result);
  });
  it("Return Question List", async () => {
    mockAxios.post.mockResolvedValue({
      data: questionListResponse,
      status: 200,
    });
    const questions = await api.getQuestions(123456);
    expect(questions).toEqual(questionListResponse.result);
  });
});
