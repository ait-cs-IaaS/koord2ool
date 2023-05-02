import { ResponseModel, FilteredResponse } from "../types/response.model";

export const filteredResponses1: FilteredResponse[] = [
  {
    token: "Ra72zk3nno95VMn",
    time: new Date("2023-02-21T08:17:23.000Z"),
    value: "No",
  },
  {
    token: "f6HJjvqOl6qLPdT",
    time: new Date("2023-02-22T10:57:52.000Z"),
    value: "No",
  },
  {
    token: "Ra72zk3nno95VMn",
    time: new Date("2023-02-22T12:16:10.000Z"),
    value: "Yes",
  },
];

export const responses1: ResponseModel[] = [
  {
    id: "18",
    submitdate: "2023-02-22 11:57:52",
    lastpage: "1",
    startlanguage: "en",
    seed: "1792446601",
    token: "f6HJjvqOl6qLPdT",
    startdate: "2023-02-22 11:57:00",
    datestamp: "2023-02-22 11:57:52",
    G01Q01HO: "No",
  },
  {
    id: "12",
    submitdate: "2023-02-21 09:17:23",
    lastpage: "1",
    startlanguage: "en",
    seed: "766036386",
    token: "Ra72zk3nno95VMn",
    startdate: "2023-02-20 10:33:59",
    datestamp: "2023-02-21 09:17:23",
    G01Q01HO: "No",
  },
  {
    id: "19",
    submitdate: "2023-02-22 13:16:10",
    lastpage: "1",
    startlanguage: "en",
    seed: "609758360",
    token: "Ra72zk3nno95VMn",
    startdate: "2023-02-22 13:12:34",
    datestamp: "2023-02-22 13:16:10",
    G01Q01HO: "Yes",
  },
];

export const filteredResponsesWithExpired: FilteredResponse[] = [
  ...filteredResponses1,
  {
    time: new Date("2023-03-01T10:57:52.000Z"),
    token: "f6HJjvqOl6qLPdT",
    value: "N/A",
  },
  {
    time: new Date("2023-03-01T12:16:10.000Z"),
    token: "Ra72zk3nno95VMn",
    value: "N/A",
  },
];
