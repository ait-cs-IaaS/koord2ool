export default interface ResponseModel {
  id: string;

  ipaddr?: string;

  lastpage?: string;

  seed?: string;

  startlanguage?: string;

  submitdate?: string;

  token?: string;

  TIME?: string;

  [key: string]: string | null | undefined;
}

const ignoreKeys: (keyof ResponseModel)[] = [
  "id",
  "ipaddr",
  "lastpage",
  "seed",
  "startlanguage",
  "submitdate",
  "token",
];

export function strip(response: ResponseModel): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(response).forEach(([key, value]) => {
    if (!ignoreKeys.includes(key) && typeof value === "string") {
      result[key] = value;
    }
  });
  return result;
}
