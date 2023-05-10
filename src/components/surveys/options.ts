import { SettingsKey, SettingsOption } from "../../types/settings.model";

const useLogicalTime = {
  title: "Time display",
  options: [
    {
      text: "Real",
      icon: "mdi-clock",
      value: false,
      description:
        "Actual time: time-based charts will use actual timestamps of survey responses.",
    },
    {
      text: "Logical",
      icon: "mdi-timer-sand-empty",
      value: true,
      description:
        "Logical time: time-based charts will show change in responses evenly for readability purposes.",
    },
  ],
};

const displayNA = {
  title: "Display N/A",
  options: [
    {
      text: "Show N/A",
      icon: "mdi-eye",
      value: true,
      description: "Show N/A: time-based charts will show N/A values",
    },
    {
      text: "Hide N/A",
      icon: "mdi-eye-off",
      value: false,
      description: "Hide N/A: time-based charts will hide N/A values",
    },
  ],
};

const step = {
  title: "Time step",
  options: [
    {
      text: "1 hour",
      icon: "mdi-numeric-1",
      value: 1,
    },
    {
      text: "6 hours",
      icon: "mdi-numeric-6",
      value: 6,
    },
    {
      text: "24 hours",
      icon: "mdi-hours-24",
      value: 24,
    },
  ],
};

const onlyActive = {
  title: "Active answers",
  options: [
    {
      text: "All rows",
      icon: "mdi-filter-off",
      value: false,
      description: "Show all answers a user gave.",
    },
    {
      text: "Only active",
      icon: "mdi-filter",
      value: true,
      description: "Show only the last answer per user.",
    },
  ],
};

const expirationTime = {
  title: "Expiration time",
  options: [
    {
      text: "1 day",
      icon: "mdi-numeric-1",
      value: 1,
    },
    {
      text: "2 days",
      icon: "mdi-numeric-2",
      value: 2,
    },
    {
      text: "7 days",
      icon: "mdi-calendar-week",
      value: 7,
    },
    {
      text: "30 days",
      icon: "mdi-calendar-month",
      value: 30,
    },
    {
      text: "1 year",
      icon: "mdi-calendar-blank",
      value: 365,
    },
  ],
};

export const chartOptions = {
  useLogicalTime,
  step,
  expirationTime,
  displayNA,
} as Record<SettingsKey, SettingsOption>;
export const tableOptions = { onlyActive } as Record<
  SettingsKey,
  SettingsOption
>;
