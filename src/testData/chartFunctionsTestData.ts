import { ResponseModel, FilteredResponse } from "../types/response.model";
import { ChartData, ChartDataset } from "chart.js";
import { SurveyModel } from "../types/survey.model";
import { QuestionModel } from "../types/question.model";

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

export const chartData1 = [
  {
    name: "No",
    data: [
      [1676967443000, 1], // Tue 21 February 2023 08:17:23.000 UTC
      [1677063472000, 2], // Wed 22 February 2023 10:57:52.000 UTC
      [1677068170000, 1], // Wed 22 February 2023 12:16:10.000 UTC
      [1677668272000, 0], // Wed 1 March 2023 10:57:52.000 UTC
      [1677672970000, 0], // Wed 1 March 2023 12:16:20.000 UTC
    ],
  },
  {
    name: "Yes",
    data: [
      [1676967443000, 0],
      [1677063472000, 0],
      [1677068170000, 1],
      [1677668272000, 1],
      [1677672970000, 0],
    ],
  },
  {
    name: "N/A",
    data: [
      [1676967443000, 1],
      [1677063472000, 0],
      [1677068170000, 0],
      [1677668272000, 1],
      [1677672970000, 2],
    ],
  },
];

export const chartDataSetX = [
  {
    label: "No",
    data: [
      {
        x: 1676967443000, // 2023-02-21 08:17:23
        y: 1,
      },
      {
        x: 1677063472000, // 2023-02-22 10:57:52
        y: 2,
      },
      {
        x: 1677068170000, // 2023-02-22 12:16:10
        y: 1,
      },
      {
        x: 1677668272000, // 2023-03-01 10:57:52
        y: 0,
      },
      {
        x: 1677672970000, // 2023-03-01 12:16:20
        y: 0,
      },
    ],
    fill: "origin",
    backgroundColor: "#8F1616",
    stepped: true,
  },
  {
    label: "Yes",
    data: [
      {
        x: 1676967443000, // 2023-02-21 08:17:23
        y: 0,
      },
      {
        x: 1677063472000, // 2023-02-22 10:57:52
        y: 0,
      },
      {
        x: 1677068170000, // 2023-02-22 12:16:10
        y: 1,
      },
      {
        x: 1677668272000, // 2023-03-01 10:57:52
        y: 1,
      },
      {
        x: 1677672970000, // 2023-03-01 12:16:20
        y: 0,
      },
    ],
    fill: "origin",
    backgroundColor: "#3CB371",
    stepped: true,
  },
  {
    label: "N/A",
    data: [
      {
        x: 1676967443000, // 2023-02-21 08:17:23
        y: 1,
      },
      {
        x: 1677063472000, // 2023-02-22 10:57:52
        y: 0,
      },
      {
        x: 1677068170000, // 2023-02-22 12:16:10
        y: 0,
      },
      {
        x: 1677668272000, // 2023-03-01 10:57:52
        y: 1,
      },
      {
        x: 1677672970000, // 2023-03-01 12:16:20
        y: 2,
      },
    ],
    fill: "origin",
    backgroundColor: "#A4A4A4",
    stepped: true,
  },
];

export const chartDataSetYesNo: ChartDataset<"line">[] = [
  {
    label: "No",
    data: [
      {
        x: 1676967443000, // 2023-02-21 08:17:23
        y: 1,
      },
      {
        x: 1677063472000, // 2023-02-22 10:57:52
        y: 2,
      },
      {
        x: 1677068170000, // 2023-02-22 12:16:10
        y: 1,
      },
      {
        x: 1677668272000, // 2023-03-01 10:57:52
        y: 0,
      },
      {
        x: 1677672970000, // 2023-03-01 12:16:20
        y: 0,
      },
    ],
    fill: true,
    backgroundColor: "#313131",
  },
  {
    label: "Yes",
    data: [
      {
        x: 1676967443000, // 2023-02-21 08:17:23
        y: 0,
      },
      {
        x: 1677063472000, // 2023-02-22 10:57:52
        y: 0,
      },
      {
        x: 1677068170000, // 2023-02-22 12:16:10
        y: 1,
      },
      {
        x: 1677668272000, // 2023-03-01 10:57:52
        y: 1,
      },
      {
        x: 1677672970000, // 2023-03-01 12:16:20
        y: 0,
      },
    ],
    fill: true,
    backgroundColor: "#AC004B",
  },
  {
    label: "N/A",
    data: [
      {
        x: 1676967443000, // 2023-02-21 08:17:23
        y: 1,
      },
      {
        x: 1677063472000, // 2023-02-22 10:57:52
        y: 0,
      },
      {
        x: 1677068170000, // 2023-02-22 12:16:10
        y: 0,
      },
      {
        x: 1677668272000, // 2023-03-01 10:57:52
        y: 1,
      },
      {
        x: 1677672970000, // 2023-03-01 12:16:20
        y: 2,
      },
    ],
    fill: true,
    backgroundColor: "#7468E8",
  },
];

export const chartDataSetFreeText: ChartDataset<"line">[] = [];

export const filteredResponses2: FilteredResponse[] = [
  {
    token: "testuser1",
    time: new Date("2023-01-1T10:00:00.000Z"),
    value: "Erster Kommentar",
  },
  {
    token: "testuser2",
    time: new Date("2023-01-2T10:00:00.000Z"),
    value: "Freitext Test 1234",
  },
  {
    token: "testuser1",
    time: new Date("2023-01-2T15:00:00.000Z"),
    value: "Lorem Ipsum oder sowas",
  },
  {
    token: "testuser3",
    time: new Date("2023-01-4T10:00:00.000Z"),
    value: "TestDaten Text Text Text",
  },
  {
    token: "testuser1",
    time: new Date("2023-01-7T10:00:00.000Z"),
    value: "Text Text Text TestDaten",
  },
  {
    token: "testuser2",
    time: new Date("2023-01-7T15:00:00.000Z"),
    value: "Vorletzter Eintrag",
  },
  {
    token: "testuser3",
    time: new Date("2023-01-7T18:00:00.000Z"),
    value: "Letzter TestDaten Kommentar",
  },
];

export const chartDataX: ChartData<"line"> = {
  datasets: chartDataSetX,
};

export const chartDataOld: ChartData<"line"> = {
  datasets: chartDataSetYesNo,
};

export const chartData2: ChartData<"line"> = {
  datasets: chartDataSetFreeText,
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

export const surveyList1: SurveyModel[] = [
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
];

export const surveyListResponse = {
  id: 2,
  result: surveyList1,
  error: null,
};

export const questionList1: QuestionModel[] = [
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
    question_order: 2,
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
    question_order: 3,
    scale_id: 0,
    same_default: 0,
    question_theme_name: "shortfreetext",
    modulename: "",
    same_script: 0,
    gid: 1,
    relevance: "1",
  },
];

export const questionListResponse = {
  id: 3,
  result: questionList1,
  error: null,
};
