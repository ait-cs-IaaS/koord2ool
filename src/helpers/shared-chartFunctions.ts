import { chartColors } from "../components/surveys/colors";
import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";

export function getBorderColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const index = Math.abs(hash) % chartColors.length;
  console.debug(`getBorderColor(${key}) => ${chartColors[index]} || ${index}`);
  return chartColors[index];
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
