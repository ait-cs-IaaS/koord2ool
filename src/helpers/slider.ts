export function tooltipFormater(value: number): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return new Date(value).toLocaleDateString("de-AT", options);
}
