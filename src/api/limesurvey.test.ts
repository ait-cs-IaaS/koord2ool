import { LimesurveyApi } from "../api/limesurvey";
import { expect, describe, it, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import axios from "axios";
import {
  authResponse,
  surveyListResponse,
} from "../testData/chartFunctionsTestData";

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
    const api = new LimesurveyApi(
      "http://localhost:8080/index.php/admin/remotecontrol"
    );
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
    const api = new LimesurveyApi(
      "http://localhost:8080/index.php/admin/remotecontrol"
    );
    await expect(api.authenticate("", "password")).rejects.toThrowError(
      "LimeSurvey API username or password not configured"
    );
  });
  it("Return Session Token", async () => {
    const api = new LimesurveyApi(
      "http://localhost:8080/index.php/admin/remotecontrol"
    );
    await expect(api.authenticate("user", "password")).resolves.toEqual(
      "rApXJtkTOK_ovHUyH2J3ZkZrghgMfqJK"
    );
  });
});

describe("testLimesurveyAPI", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockAxios.post.mockResolvedValue({
      data: surveyListResponse,
      status: 200,
    });
  });
  it("Return Survey List", async () => {
    const api = new LimesurveyApi(
      "http://localhost:8080/index.php/admin/remotecontrol"
    );
    await expect(api.listSurveys()).resolves.toEqual(
      "rApXJtkTOK_ovHUyH2J3ZkZrghgMfqJK"
    );
  });
});
