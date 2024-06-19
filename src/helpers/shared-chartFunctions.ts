import { chartColors } from "../components/surveys/colors";
import { FilteredResponse } from "../types/response.model";
import { useSurveyStore } from "../store/surveyStore";

export function getBorderColor(key: string): string {
  return chartColors[key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % chartColors.length];
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

      const hasEntryWithinExpiration = acc.some(
        (existingResponse) =>
          existingResponse.token === response.token &&
          existingResponse.time >= response.time &&
          existingResponse.time <= expiredTime &&
          existingResponse !== response,
      );

      if (!hasEntryWithinExpiration && expiredTime <= currentDate) {
        if (expiredTime > store.untilDate) {
          return acc;
        }
        const expiredResponse: FilteredResponse = {
          token: response.token,
          time: expiredTime,
          value: "N/A",
        };

        acc.push(expiredResponse);
      }

      return acc;
    },
    [...responses],
  );
}
