import { ResponseModel, FilteredResponse } from "../types/response.model";
import { ChartData, ChartDataset } from "chart.js";
import { SurveyModel } from "../types/survey.model";
import { QuestionModel } from "../types/question.model";
import { Point } from "chart.js/dist/core/core.controller";

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
    G01Q04TEMP: "20",
    G01Q05FREE: "Erster Kommentar",
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
    G01Q04TEMP: "15",
    G01Q05FREE: "Freitext Test 1234",
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
    G01Q04TEMP: "18",
    G01Q05FREE: "Lorem Ipsum oder sowas",
  },
  {
    id: "4",
    submitdate: "2023-02-23 14:45:00",
    lastpage: "1",
    startlanguage: "en",
    seed: "1234567890",
    token: "testuser3",
    startdate: "2023-02-23 14:30:00",
    datestamp: "2023-02-23 14:45:00",
    G01Q01HO: "No",
    G01Q04TEMP: "22",
    G01Q05FREE: "Testing comment",
  },
  {
    id: "5",
    submitdate: "2023-02-23 15:50:30",
    lastpage: "1",
    startlanguage: "en",
    seed: "2345678901",
    token: "testuser4",
    startdate: "2023-02-23 15:40:20",
    datestamp: "2023-02-23 15:50:30",
    G01Q01HO: "Yes",
    G01Q04TEMP: "19",
    G01Q05FREE: "Another test comment",
  },
  {
    id: "6",
    submitdate: "2023-02-24 08:15:45",
    lastpage: "1",
    startlanguage: "en",
    seed: "3456789012",
    token: "testuser1",
    startdate: "2023-02-24 08:00:00",
    datestamp: "2023-02-24 08:15:45",
    G01Q01HO: "No",
    G01Q04TEMP: "17",
    G01Q05FREE: "Morning test comment",
  },
  {
    id: "7",
    submitdate: "2023-03-04 09:30:15",
    lastpage: "1",
    startlanguage: "en",
    seed: "4567890123",
    token: "testuser5",
    startdate: "2023-03-04 09:20:10",
    datestamp: "2023-03-04 09:30:15",
    G01Q01HO: "Yes",
    G01Q04TEMP: "16",
    G01Q05FREE: "Comment number five",
  },
  {
    id: "8",
    submitdate: "2023-05-24 11:45:50",
    lastpage: "1",
    startlanguage: "en",
    seed: "5678901234",
    token: "testuser3",
    startdate: "2023-05-24 11:30:00",
    datestamp: "2023-05-24 11:45:50",
    G01Q01HO: "No",
    G01Q04TEMP: "21",
    G01Q05FREE: "Midday test comment",
  },
];

export const filteredResponses1: FilteredResponse[] = [
  {
    token: "testuser2",
    time: new Date("2023-02-21T08:17:23.000Z"),
    answer: "No",
  },
  {
    token: "testuser1",
    time: new Date("2023-02-22T10:57:52.000Z"),
    answer: "No",
  },
  {
    token: "testuser2",
    time: new Date("2023-02-22T12:16:10.000Z"),
    answer: "Yes",
  },
  {
    token: "testuser3",
    time: new Date("2023-02-23T13:45:00.000Z"),
    answer: "No",
  },
  {
    token: "testuser4",
    time: new Date("2023-02-23T14:50:30.000Z"),
    answer: "Yes",
  },
  {
    token: "testuser1",
    time: new Date("2023-02-24T07:15:45.000Z"),
    answer: "No",
  },
  {
    token: "testuser5",
    time: new Date("2023-03-04T08:30:15.000Z"),
    answer: "Yes",
  },
  {
    token: "testuser3",
    time: new Date("2023-05-24T10:45:50.000Z"),
    answer: "No",
  },
];

export const filteredResponsesWithExpired: FilteredResponse[] = [
  ...filteredResponses1,
  {
    answer: "N/A",
    time: new Date("2023-03-01T12:16:10.000Z"),
    token: "testuser2",
  },
  {
    answer: "N/A",
    time: new Date("2023-03-02T13:45:00.000Z"),
    token: "testuser3",
  },
  {
    answer: "N/A",
    time: new Date("2023-03-02T14:50:30.000Z"),
    token: "testuser4",
  },
  {
    answer: "N/A",
    time: new Date("2023-03-03T07:15:45.000Z"),
    token: "testuser1",
  },
  {
    answer: "N/A",
    time: new Date("2023-03-11T08:30:15.000Z"),
    token: "testuser5",
  },
  {
    answer: "N/A",
    time: new Date("2023-05-31T10:45:50.000Z"),
    token: "testuser3",
  },
];

export const chartData1 = [
  {
    name: "No",
    data: [
      [1676967443000, 1], // 2023-02-21 08:17:23
      [1677063472000, 2], // 2023-02-22 10:57:52
      [1677068170000, 1], // 2023-02-22 12:16:10
      [1677159900000, 2], // 2023-02-23 13:45:00
      [1677163830000, 2], // 2023-02-23 14:50:30
      [1677222945000, 2], // 2023-02-24 07:15:45
      [1677672970000, 2], // 2023-03-01 12:16:10
      [1677764700000, 1], // 2023-03-02 13:45:00
      [1677768630000, 1], // 2023-03-02 14:50:30
      [1677827745000, 0], // 2023-03-03 07:15:45
      [1677918615000, 0], // 2023-03-04 08:30:15
      [1678523415000, 0], // 2023-03-11 08:30:15
      [1684925150000, 1], // 2023-05-24 09:45:50
      [1685529950000, 0], // 2023-05-31 10:45:50
    ],
  },
  {
    name: "Yes",
    data: [
      [1676967443000, 0],
      [1677063472000, 0],
      [1677068170000, 1],
      [1677159900000, 1],
      [1677163830000, 2],
      [1677222945000, 2],
      [1677672970000, 1],
      [1677764700000, 1],
      [1677768630000, 0],
      [1677827745000, 0],
      [1677918615000, 1],
      [1678523415000, 0],
      [1684925150000, 0],
      [1685529950000, 0],
    ],
  },
  {
    name: "N/A",
    data: [
      [1676967443000, 4],
      [1677063472000, 3],
      [1677068170000, 3],
      [1677159900000, 2],
      [1677163830000, 1],
      [1677222945000, 1],
      [1677672970000, 2],
      [1677764700000, 3],
      [1677768630000, 4],
      [1677827745000, 5],
      [1677918615000, 4],
      [1678523415000, 5],
      [1684925150000, 4],
      [1685529950000, 5],
    ],
  },
];

export const chartDataSet = [
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
        x: 1677159900000, // 2023-02-23 13:45:00
        y: 2,
      },
      {
        x: 1677163830000, // 2023-02-23 14:50:30
        y: 2,
      },
      {
        x: 1677222945000, // 2023-02-24 07:15:45
        y: 2,
      },
      {
        x: 1677672970000, // 2023-03-01 12:16:10
        y: 2,
      },
      {
        x: 1677764700000, // 2023-03-02 13:45:00
        y: 1,
      },
      {
        x: 1677768630000, // 2023-03-02 14:50:30
        y: 1,
      },
      {
        x: 1677827745000, // 2023-03-03 07:15:45
        y: 0,
      },
      {
        x: 1677918615000, // 2023-03-04 08:30:15
        y: 0,
      },
      {
        x: 1678523415000, // 2023-03-11 08:30:15
        y: 0,
      },
      {
        x: 1684921550000, // 2023-05-24 09:45:50
        y: 1,
      },
      {
        x: 1685526350000, // 2023-05-31 09:45:50
        y: 0,
      },
    ],
    fill: true,
    backgroundColor: "#8F1616",
    cubicInterpolationMode: "monotone" as const,
    pointRadius: 1,
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
        x: 1677159900000, // 2023-02-23 13:45:00
        y: 1,
      },
      {
        x: 1677163830000, // 2023-02-23 14:50:30
        y: 2,
      },
      {
        x: 1677222945000,
        y: 2,
      },
      {
        x: 1677672970000,
        y: 1,
      },
      {
        x: 1677764700000,
        y: 1,
      },
      {
        x: 1677768630000,
        y: 0,
      },
      {
        x: 1677827745000,
        y: 0,
      },
      {
        x: 1677918615000,
        y: 1,
      },
      {
        x: 1678523415000,
        y: 0,
      },
      {
        x: 1684921550000,
        y: 0,
      },
      {
        x: 1685526350000,
        y: 0,
      },
    ],
    fill: true,
    backgroundColor: "#3CB371",
    cubicInterpolationMode: "monotone" as const,
    pointRadius: 1,
  },
  {
    label: "N/A",
    data: [
      {
        x: 1676967443000, // 2023-02-21 08:17:23
        y: 4,
      },
      {
        x: 1677063472000, // 2023-02-22 10:57:52
        y: 3,
      },
      {
        x: 1677068170000, // 2023-02-22 12:16:10
        y: 3,
      },
      {
        x: 1677159900000, // 2023-02-23 13:45:00
        y: 2,
      },
      {
        x: 1677163830000, // 2023-02-23 14:50:30
        y: 1,
      },
      {
        x: 1677222945000,
        y: 1,
      },
      {
        x: 1677672970000,
        y: 2,
      },
      {
        x: 1677764700000,
        y: 3,
      },
      {
        x: 1677768630000,
        y: 4,
      },
      {
        x: 1677827745000,
        y: 5,
      },
      {
        x: 1677918615000,
        y: 4,
      },
      {
        x: 1678523415000,
        y: 5,
      },
      {
        x: 1684921550000,
        y: 4,
      },
      {
        x: 1685526350000,
        y: 5,
      },
    ],
    fill: true,
    backgroundColor: "#A4A4A4",
    cubicInterpolationMode: "monotone" as const,
    pointRadius: 1,
  },
];

export const chartDataSetFreeText: ChartDataset<"line">[] = [
  {
    borderColor: "#3CB371",
    data: [
      {
        tooltip: "Freitext Test 1234",
        x: 1676967443000,
        y: 1,
      } as Point,
      {
        tooltip: "Lorem Ipsum oder sowas",
        x: 1677068170000,
        y: 1,
      } as Point,
    ],
    fill: false,
    label: "testuser2",
  },
  {
    borderColor: "#AC004B",
    data: [
      {
        tooltip: "Erster Kommentar",
        x: 1677063472000,
        y: 0,
      } as Point,
      {
        tooltip: "Morning test comment",
        x: 1677222945000,
        y: 0,
      } as Point,
    ],
    fill: false,
    label: "testuser1",
  },
  {
    borderColor: "#D3802B",
    data: [
      {
        tooltip: "Testing comment",
        x: 1677159900000,
        y: 2,
      } as Point,
      {
        tooltip: "Midday test comment",
        x: 1684921550000,
        y: 2,
      } as Point,
    ],
    fill: false,
    label: "testuser3",
  },
  {
    borderColor: "#DDBC42",
    data: [
      {
        tooltip: "Another test comment",
        x: 1677163830000,
        y: 3,
      } as Point,
    ],
    fill: false,
    label: "testuser4",
  },
  {
    borderColor: "#313131",
    data: [
      {
        tooltip: "Comment number five",
        x: 1677918615000,
        y: 4,
      } as Point,
    ],
    fill: false,
    label: "testuser5",
  },
];

export const chartDataSetNumerical: ChartDataset<"bar">[] = [
  {
    data: [1, 2, 3, 4, 5, 6, 7, 8],
    label: "G01Q04TEMP",
  },
];

export const chartDataYesNo: ChartData<"line"> = {
  datasets: chartDataSet,
};

export const chartDataFreeText: ChartData<"line"> = {
  datasets: chartDataSetFreeText,
};

export const chartDataNumerical: ChartData<"bar"> = {
  datasets: chartDataSetNumerical,
};

export const filteredResponses2: FilteredResponse[] = [
  {
    token: "testuser1",
    time: new Date("2023-01-1T10:00:00.000Z"),
    answer: "Erster Kommentar",
  },
  {
    token: "testuser2",
    time: new Date("2023-01-2T10:00:00.000Z"),
    answer: "Freitext Test 1234",
  },
  {
    token: "testuser1",
    time: new Date("2023-01-2T15:00:00.000Z"),
    answer: "Lorem Ipsum oder sowas",
  },
  {
    token: "testuser3",
    time: new Date("2023-01-4T10:00:00.000Z"),
    answer: "TestDaten Text Text Text",
  },
  {
    token: "testuser1",
    time: new Date("2023-01-7T10:00:00.000Z"),
    answer: "Text Text Text TestDaten",
  },
  {
    token: "testuser2",
    time: new Date("2023-01-7T15:00:00.000Z"),
    answer: "Vorletzter Eintrag",
  },
  {
    token: "testuser3",
    time: new Date("2023-01-7T18:00:00.000Z"),
    answer: "Letzter TestDaten Kommentar",
  },
];

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
