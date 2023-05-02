import { expect, describe, it, beforeEach } from "vitest";
import { filterResponses, addExpiredEntries } from "./chartFunctions";
import { setActivePinia, createPinia } from "pinia";
import {
  responses1,
  filteredResponses1,
  filteredResponsesWithExpired,
} from "../testData/chartFunctionsTestData";

describe("testFilteredResponses", () => {
  it("should return an empty array if no responses are provided", () => {
    expect(filterResponses("test", [])).toEqual([]);
  });

  it("should return an array of FilteredResponses", () => {
    expect(filteredResponses1).toEqual(filterResponses("G01Q01HO", responses1));
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
