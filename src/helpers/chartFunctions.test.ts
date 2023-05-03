import { expect, describe, it, beforeEach } from "vitest";
import {
  filterResponses,
  addExpiredEntries,
  addCurrentStateForEachToken,
  parseDataForLineChart,
  createTimelineFor,
} from "./chartFunctions";
import { setActivePinia, createPinia } from "pinia";
import {
  responses1,
  filteredResponses1,
  filteredResponsesWithExpired,
  responsesEnhancedAndFilterd,
  chartData1,
} from "../testData/chartFunctionsTestData";

describe("testFilteredResponses", () => {
  it("should return an empty array if no responses are provided", () => {
    expect(filterResponses("test", [])).toEqual([]);
  });

  it("should return an array of FilteredResponses", () => {
    expect(filterResponses("G01Q01HO", responses1)).toEqual(filteredResponses1);
  });
});

describe("testAddExpiredEntries", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should return an empty array if no responses are provided", () => {
    expect(addExpiredEntries([])).toEqual([]);
  });

  it("should return an array of FilteredResponses enriched with expired resposes", () => {
    expect(addExpiredEntries(filteredResponses1)).toEqual(
      filteredResponsesWithExpired
    );
  });
});

describe("testAddCurrentStateForEachToken", () => {
  it("should return an empty array if no responses are provided", () => {
    expect(addCurrentStateForEachToken([])).toEqual([]);
  });

  it("should return an array of FilteredResponses with all answers from each token at each input element", () => {
    expect(addCurrentStateForEachToken(filteredResponsesWithExpired)).toEqual(
      responsesEnhancedAndFilterd
    );
  });
});

describe("testParseDataForLineChart", () => {
  it("should return an empty array if no responses are provided", () => {
    expect(parseDataForLineChart([])).toEqual({ datasets: [] });
  });

  it("should return an array of FilteredResponses enriched with expired resposes", () => {
    expect(parseDataForLineChart(responsesEnhancedAndFilterd)).toEqual(
      chartData1
    );
  });
});

describe("testCreateTimelineFor", () => {
  it("should return an empty array if no responses are provided", () => {
    expect(createTimelineFor("test", [])).toEqual({ datasets: [] });
  });

  it("should return an array of FilteredResponses enriched with expired resposes", () => {
    expect(createTimelineFor("G01Q01HO", responses1)).toEqual(chartData1);
  });
});
