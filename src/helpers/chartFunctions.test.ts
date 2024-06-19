import { expect, describe, it, beforeEach } from "vitest";
import { createTimelineFor, createNumericChartData } from "./chartFunctions";
import { parseDataForAreaChart } from "./yesno-charts";
import { addExpiredEntries } from "./shared-chartFunctions";
import { setActivePinia, createPinia } from "pinia";
import {
  responses1,
  filteredResponses1,
  filteredResponsesWithExpired,
  surveyList1,
  questionList1,
  chartData1,
  chartDataYesNo,
  chartDataNumerical,
  chartDataFreeText,
} from "../testData/chartFunctionsTestData";
import { useSurveyStore } from "../store/surveyStore";

describe("testAddExpiredEntries", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should return an empty array if no responses are provided", () => {
    expect(addExpiredEntries([])).toEqual([]);
  });

  it("should return an array of FilteredResponses enriched with expired resposes", () => {
    expect(addExpiredEntries(filteredResponses1)).toEqual(filteredResponsesWithExpired);
  });
});

describe("testParseDataForAreaChart", () => {
  it("should return an empty array if no responses are provided", () => {
    expect(parseDataForAreaChart([])).toEqual([]);
  });

  it("should return an array of FilteredResponses enriched with expired resposes", () => {
    expect(parseDataForAreaChart(filteredResponsesWithExpired)).toEqual(chartData1);
  });
});

describe("testCreateTimelineFor", () => {
  setActivePinia(createPinia());
  const store = useSurveyStore();

  beforeEach(() => {
    store.updateSurveyList(surveyList1);
    store.updateQuestions(surveyList1[0].sid, questionList1);
    store.settings.expirationTime = 7;
    store.responses[123456] = responses1;
  });
  it("should return an empty array if no responses are provided", () => {
    store.selectedSurveyID = 999999;
    expect(createTimelineFor("test")).toEqual({ datasets: [] });
  });

  it("should return an chartData for a YESNO chart", () => {
    store.selectedSurveyID = 123456;
    expect(createTimelineFor("G01Q01HO")).toEqual(chartDataYesNo);
  });

  it("should return an chartData for a Numerical chart", () => {
    store.selectedSurveyID = 123456;
    expect(createNumericChartData("G01Q04TEMP")).toEqual(chartDataNumerical);
  });

  it("should return an chartData for a Freetext chart", () => {
    store.selectedSurveyID = 123456;
    expect(createTimelineFor("G01Q05FREE")).toEqual(chartDataFreeText);
  });
});
