import { chartColors } from "../components/surveys/colors";
import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";

const keyToColorMap: Record<string, string> = {};

export function getBorderColor(key:string) : string{
  if (!keyToColorMap[key]) {
    const index = Object.keys(keyToColorMap).length % chartColors.length;
    keyToColorMap[key] = chartColors[index];
  } 
  return keyToColorMap[key];
}

function expirationDate(relativeDate: Date): Date {
  const store = useSurveyStore();
  return new Date(relativeDate.getTime() + store.settings.expirationTime * 24 * 60 * 60 * 1000);
}

export function addExpiredEntries(responses: FilteredResponse[]): FilteredResponse[] {
  const store = useSurveyStore();
  const currentDate = new Date();

  return responses.reduce(
    (acc, response) => {
      const expiredTime = expirationDate(response.time);

      if (expiredTime > store.untilDate || expiredTime > currentDate) {
        return acc;
      }

      const hasEntryWithinExpiration = acc.some(
        (existingResponse) =>
          existingResponse.token === response.token &&
          existingResponse.time >= response.time &&
          existingResponse.time <= expiredTime &&
          existingResponse !== response,
      );

      if (!hasEntryWithinExpiration) {
        const expiredResponse: FilteredResponse = {
          token: response.token,
          time: expiredTime,
          answer: "N/A",
        };

        acc.push(expiredResponse);
      }

      return acc;
    },
    [...responses],
  );
}
