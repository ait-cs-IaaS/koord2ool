import { LimesurveyApi } from "../api/limesurvey";
import { expect, describe, it, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import axios from "axios";
import { authResponse, surveyListResponse, questionListResponse, expiredSessionResponse } from "../testData/chartFunctionsTestData";
import router from "../router";

vi.mock("axios");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mockAxios = axios as Vi.Mocked<typeof axios>;

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

describe("testLimesurveyAPI", () => {
  let api: LimesurveyApi;
  beforeEach(() => {
    setActivePinia(createPinia());
    api = new LimesurveyApi("http://localhost:8080/index.php/admin/remotecontrol");
    api.setSession("1234", "user");
  });
  it("Should redirect to login if session key is expired", async () => {
    const pushSpy = vi.spyOn(router, "push");

    mockAxios.post.mockResolvedValue({
      data: expiredSessionResponse,
      status: 200,
    });
    const surveys = await api.listSurveys();
    expect(surveys).toEqual({ status: "Invalid session key" });
    expect(pushSpy).toHaveBeenCalledWith({ name: "login" });
  });

  it("Return Survey List", async () => {
    mockAxios.post.mockResolvedValue({
      data: surveyListResponse,
      status: 200,
    });
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
