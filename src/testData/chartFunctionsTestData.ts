import { ResponseModel, FilteredResponse } from "../types/response.model";
import { ChartData, ChartDataset } from "chart.js";

export const responses1: ResponseModel[] = [
  {
    id: "1",
    submitdate: "2023-02-22 11:57:52",
    lastpage: "1",
    startlanguage: "en",
    seed: "9876543210",
    token: "testuser1",
    startdate: "2023-02-22 11:57:00",
    datestamp: "2023-02-22 11:57:52",
    G01Q01HO: "No",
  },
  {
    id: "2",
    submitdate: "2023-02-21 09:17:23",
    lastpage: "1",
    startlanguage: "en",
    seed: "8976543210",
    token: "testuser2",
    startdate: "2023-02-20 10:33:59",
    datestamp: "2023-02-21 09:17:23",
    G01Q01HO: "No",
  },
  {
    id: "3",
    submitdate: "2023-02-22 13:16:10",
    lastpage: "1",
    startlanguage: "en",
    seed: "8796543210",
    token: "testuser2",
    startdate: "2023-02-22 13:12:34",
    datestamp: "2023-02-22 13:16:10",
    G01Q01HO: "Yes",
  },
];

export const filteredResponses1: FilteredResponse[] = [
  {
    token: "testuser2",
    time: new Date("2023-02-21T08:17:23.000Z"),
    value: "No",
  },
  {
    token: "testuser1",
    time: new Date("2023-02-22T10:57:52.000Z"),
    value: "No",
  },
  {
    token: "testuser2",
    time: new Date("2023-02-22T12:16:10.000Z"),
    value: "Yes",
  },
];

export const filteredResponsesWithExpired: FilteredResponse[] = [
  ...filteredResponses1,
  {
    time: new Date("2023-03-01T10:57:52.000Z"),
    token: "testuser1",
    value: "N/A",
  },
  {
    time: new Date("2023-03-01T12:16:10.000Z"),
    token: "testuser2",
    value: "N/A",
  },
];

export const responsesEnhancedAndFilterd: FilteredResponse[] = [
  {
    time: new Date("2023-02-21T08:17:23.000Z"),
    token: "testuser2",
    value: "No",
  },
  {
    time: new Date("2023-02-21T08:17:23.000Z"),
    token: "testuser1",
    value: "N/A",
  },
  {
    time: new Date("2023-02-22T10:57:52.000Z"),
    token: "testuser1",
    value: "No",
  },
  {
    time: new Date("2023-02-22T10:57:52.000Z"),
    token: "testuser2",
    value: "No",
  },
  {
    time: new Date("2023-02-22T12:16:10.000Z"),
    token: "testuser2",
    value: "Yes",
  },
  {
    time: new Date("2023-02-22T12:16:10.000Z"),
    token: "testuser1",
    value: "No",
  },
  {
    time: new Date("2023-03-01T10:57:52.000Z"),
    token: "testuser1",
    value: "N/A",
  },
  {
    time: new Date("2023-03-01T10:57:52.000Z"),
    token: "testuser2",
    value: "Yes",
  },
  {
    time: new Date("2023-03-01T12:16:10.000Z"),
    token: "testuser2",
    value: "N/A",
  },
  {
    time: new Date("2023-03-01T12:16:10.000Z"),
    token: "testuser1",
    value: "N/A",
  },
];

export const chartDataSet: ChartDataset<"line">[] = [
  {
    label: "No",
    data: [
      {
        x: 1676967443000,
        y: 1,
      },
      {
        x: 1677063472000,
        y: 2,
      },
      {
        x: 1677068170000,
        y: 1,
      },
    ],
    fill: false,
    borderColor: "#313131",
  },
  {
    label: "N/A",
    data: [
      {
        x: 1676967443000,
        y: 1,
      },
      {
        x: 1677668272000,
        y: 1,
      },
      {
        x: 1677672970000,
        y: 2,
      },
    ],
    fill: false,
    borderColor: "#7468E8",
  },
  {
    label: "Yes",
    data: [
      {
        x: 1677068170000,
        y: 1,
      },
      {
        x: 1677668272000,
        y: 1,
      },
    ],
    fill: false,
    borderColor: "#AC004B",
  },
];

export const chartData1: ChartData<"line"> = {
  datasets: chartDataSet,
};

export const authResponse = {
  id: 1,
  result: "rApXJtkTOK_ovHUyH2J3ZkZrghgMfqJK",
  error: null,
};

export const expiredSessionResponse = {
  id: 2,
  result: {
    status: "Invalid session key",
  },
  error: null,
};

export const surveyListResponse = {
  id: 2,
  result: [
    {
      sid: 123456,
      surveyls_title: "Test 1",
      startdate: null,
      expires: null,
      active: "Y",
    },
    {
      sid: 123457,
      surveyls_title: "Test Survey 2",
      startdate: null,
      expires: null,
      active: "N",
    },
  ],
  error: null,
};

export const questionListResponse = {
  id: 3,
  result: [
    {
      id: 2,
      question: "Arbeitest du heute im Homeoffice?",
      help: "",
      language: "en",
      qid: 2,
      parent_qid: 0,
      sid: 123456,
      type: "Y",
      title: "G01Q01HO",
      preg: null,
      other: "N",
      mandatory: "N",
      encrypted: "N",
      question_order: 1,
      scale_id: 0,
      same_default: 0,
      question_theme_name: "yesno",
      modulename: "",
      same_script: 0,
      gid: 1,
      relevance: "1",
    },
    {
      id: 3,
      question: "Wie warm ist es gerade draußen (°C)?",
      help: "",
      language: "en",
      qid: 5,
      parent_qid: 0,
      sid: 944175,
      type: "N",
      title: "G01Q04TEMP",
      preg: "",
      other: "N",
      mandatory: "N",
      encrypted: "N",
      question_order: 4,
      scale_id: 0,
      same_default: 0,
      question_theme_name: "numerical",
      modulename: "",
      same_script: 0,
      gid: 1,
      relevance: "1",
    },
    {
      id: 4,
      question: "Kommentar?",
      help: "",
      language: "en",
      qid: 6,
      parent_qid: 0,
      sid: 944175,
      type: "S",
      title: "G01Q05FREE",
      preg: "",
      other: "N",
      mandatory: "N",
      encrypted: "N",
      question_order: 5,
      scale_id: 0,
      same_default: 0,
      question_theme_name: "shortfreetext",
      modulename: "",
      same_script: 0,
      gid: 1,
      relevance: "1",
    },
  ],
  error: null,
};
