import { ChartData, ChartDataset, Point } from "chart.js";
import { chartColors } from "../components/surveys/colors";
import { koordStore } from "../store";
import {
  ResponseModel,
  responseCount,
  FilteredResponse,
  HyperResponse,
} from "../types/response.model";
import { QuestionModel } from "../types/question.model";

function getBorderColor(key: string): string {
  return chartColors[
    key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      chartColors.length
  ];
}

export function countResponsesFor(
  questionKey: string,
  lastResponses: ResponseModel[]
): responseCount[] {
  const responseCounts: responseCount[] = [];
  lastResponses.forEach((response) => {
    const answer = getAnswer(questionKey, response);

    const existingIndex = responseCounts.findIndex(
      (item) => item.name === answer
    );

    if (existingIndex !== -1) {
      responseCounts[existingIndex].value++;
    } else {
      responseCounts.push({ name: answer, value: 1 });
    }
  });

  responseCounts.sort((a, b) => {
    if (a.name.length === b.name.length) return 0;
    return a.name.length - b.name.length;
  });

  return responseCounts;
}

function isResponseExpired(response: ResponseModel, expireDate: Date): boolean {
  return new Date(response.submitdate) <= expireDate;
}

function getAnswer(questionKey: string, response: ResponseModel): string {
  const store = koordStore();
  if (isResponseExpired(response, store.getExpireDate)) {
    return "N/A";
  }
  return response[questionKey] || "N/A";
}

function responseMapper(
  questionKey: string,
  response: ResponseModel
): FilteredResponse {
  return {
    token: response.token,
    time: new Date(response.submitdate),
    value: response[questionKey] || "N/A",
  };
}

function expirationDate(relativeDate: Date): Date {
  const store = koordStore();
  return new Date(
    relativeDate.getTime() + store.settings.expirationTime * 24 * 60 * 60 * 1000
  );
}

export function addExpiredEntries(
  responses: FilteredResponse[]
): FilteredResponse[] {
  const newResponses: FilteredResponse[] = [...responses];
  const currentDate = new Date();

  responses.forEach((response) => {
    const expiredTime = expirationDate(response.time);

    const hasEntryWithinExpiration = newResponses.some((existingResponse) => {
      return (
        existingResponse.token === response.token &&
        existingResponse.time >= response.time &&
        existingResponse.time <= expiredTime &&
        existingResponse !== response
      );
    });

    if (!hasEntryWithinExpiration && expiredTime <= currentDate) {
      const expiredResponse: FilteredResponse = {
        token: response.token,
        time: expiredTime,
        value: "N/A",
      };

      newResponses.push(expiredResponse);
    }
  });

  return newResponses;
}

export function filterResponses(
  questionKey: string,
  responses: ResponseModel[]
): FilteredResponse[] {
  return responses
    .map((response) => responseMapper(questionKey, response))
    .sort((a, b) => a.time.valueOf() - b.time.valueOf());
}

function getAllTokens(responses: FilteredResponse[]): string[] {
  const tokens: string[] = [];

  responses.forEach((response) => {
    if (!tokens.includes(response.token)) {
      tokens.push(response.token);
    }
  });

  return tokens;
}

export function addCurrentStateForEachToken(
  responses: FilteredResponse[],
  tokens: string[]
): HyperResponse[] {
  const responseList = valuesFromResponses(responses);

  return responses.reduce((acc: HyperResponse[], item: FilteredResponse) => {
    const hyper: HyperResponse =
      acc.length > 0
        ? {
            values: new Map(
              JSON.parse(JSON.stringify(Array.from(acc[acc.length - 1].values)))
            ),
            time: item.time,
          }
        : {
            time: item.time,
            values: new Map<string, string[]>(
              responseList.map((value) => {
                if (value === "N/A") {
                  return [value, [...tokens]];
                }
                return [value, []];
              })
            ),
          };

    responseList.forEach((resp) => {
      if (resp === item.value) {
        hyper.values.get(resp)?.push(item.token);
      } else {
        hyper.values.set(
          resp,
          hyper.values.get(resp)!.filter((token) => token !== item.token)
        );
      }
    });

    acc.push(hyper);

    return acc;
  }, new Array<HyperResponse>());
}

export function getQuestionText(
  questionKey: string,
  questions: Record<string, QuestionModel>
): string {
  const key = questionKey.split("[");
  const question = questions[key[0]];
  if (question === undefined) {
    return "";
  }
  if (key.length === 1) {
    return question.question;
  }
  const subquestion = key[1].split("]")[0];
  if (
    question.subquestions !== undefined &&
    subquestion !== undefined &&
    question.subquestions[subquestion] !== undefined
  ) {
    return question.subquestions[subquestion];
  }
  return question.question;
}

export function getQuestionType(
  questionKey: string,
  questions: Record<string, QuestionModel>
): string {
  const key = questionKey.split("[");
  const question = questions[key[0]];
  if (question === undefined) {
    return "";
  }
  return question.question_theme_name || "";
}

export function valuesFromResponses(data: FilteredResponse[]): Array<string> {
  const store = koordStore();

  const combinedData = data.filter(
    (item) =>
      item.value !== "N/A" || (store.settings.displayNA && item.value === "N/A")
  );

  return Array.from(new Set(combinedData.map((item) => item.value)));
}

export function parseDataForLineChart(
  hypers: HyperResponse[]
): ChartData<"line"> {
  const parsedData: ChartDataset<"line">[] = [];

  const responseList = Array.from(hypers[0].values.keys());

  const store = koordStore();
  const finalTime = store.untilDate.getTime();

  responseList.forEach((value) => {
    parsedData.push({
      label: value,
      data: [],
      fill: "shape",
      backgroundColor: getBorderColor(value),
    });
  });

  hypers.forEach((hyper, hyperIndex) => {
    const untilTime = hyper.time.getTime();

    let offset = 0;
    responseList.forEach((value, i) => {
      const lastY = (parsedData[i]?.data.at(-1) as Point)?.y || offset;
      const currentY = hyper.values.get(value)!.length;

      const direction =
        currentY - hypers[hyperIndex - 1]?.values.get(value)!.length;

      const dataPoints = [
        { x: untilTime, y: lastY },
        { x: untilTime, y: currentY + offset },
      ];
      offset += currentY;

      parsedData[i]?.data.push(...dataPoints);
    });
  });

  responseList.forEach((value, i) => {
    parsedData[i]?.data.push({
      x: finalTime,
      y: 0,
    });
  });

  // const store = koordStore();

  // const values = valuesFromResponses(data);

  // let lastY = 0;
  // const untilTime = store.untilDate.getTime();

  // values.forEach((value) => {
  //   const aggregatedData: Record<number, number> = data
  //     .filter((item) => item.value === value)
  //     .reduce((acc: Record<number, number>, item) => {
  //       const dateKey = item.time.getTime();
  //       if (!acc[dateKey]) {
  //         acc[dateKey] = 0;
  //       }
  //       acc[dateKey]++;
  //       return acc;
  //     }, {});

  //   const lineData = Object.entries(aggregatedData).flatMap(([date, count]) => {
  //     const dataPoints = [
  //       { x: parseInt(date), y: lastY },
  //       { x: parseInt(date), y: count },
  //     ];

  //     lastY = Math.max(0, count);

  //     return dataPoints;
  //   });

  //   lineData.push({ x: untilTime, y: lastY });
  //   lineData.push({ x: untilTime, y: 0 });

  //   if (lineData.length > 0) {
  //     parsedData.push({
  //       label: value,
  //       data: lineData,
  //       fill: "shape",
  //       backgroundColor: getBorderColor(value),
  //     });
  //   }
  // });

  return {
    datasets: parsedData,
  };
}

export function parseDataForFreeTextChart(
  data: FilteredResponse[]
): ChartData<"line"> {
  const parsedData: Record<string, ChartDataset<"line">> = {};
  const store = koordStore();

  data.forEach((item) => {
    if (!parsedData[item.token]) {
      parsedData[item.token] = {
        label: item.token,
        data: [],
        fill: false,
        borderColor: getBorderColor(item.token),
      };
    }
    const point = {
      tooltip: item.value,
      x: item.time.getTime(),
      y: store.tokenMap[item.token] || 0,
    };
    parsedData[item.token].data.push(point);
  });

  return {
    datasets: Object.values(parsedData),
  };
}

export function createTimelineFor(
  questionKey: string,
  surveyId: number
): ChartData<"line"> {
  const store = koordStore();
  const question_type = store.getQuestionType(surveyId, questionKey);
  const filteredResponses = filterResponses(
    questionKey,
    store.responsesInTimeline(surveyId)
  );

  const tokens = getAllTokens(filteredResponses);
  store.updateTokenMap(surveyId);

  if (question_type === "yesno") {
    const enrichedResponses = addExpiredEntries(filteredResponses);
    const result = addCurrentStateForEachToken(enrichedResponses, tokens);
    console.debug(result);
    return parseDataForLineChart(result);
  }

  return parseDataForFreeTextChart(filteredResponses);
}
