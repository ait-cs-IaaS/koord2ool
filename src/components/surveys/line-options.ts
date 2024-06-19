import { ChartOptions, TooltipItem } from "chart.js";
import { useSurveyStore } from "../../store/surveyStore";
import { getParticipant } from "../../helpers/chartFunctions";
const store = useSurveyStore();

/* eslint-disable @typescript-eslint/no-explicit-any */
export const areaChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: "time",
      time: {
        unit: "day",
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: function (value) {
          return value;
        },
      },
    },
  },
  plugins: {
    filler: {
      propagate: true,
    },
    legend: {
      display: true,
      position: "top",
      align: "center",
      maxWidth: 200,
    },
    tooltip: {
      callbacks: {
        label: function (context: TooltipItem<"line">) {
          return (context.raw as any)?.tooltip || `${context.dataset.label}: ${context.formattedValue}`;
        },
      },
    },
  },
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
};

function findKeyByValue(object: Record<string, number>, value: number): string {
  for (const prop in object) {
    if (Object.hasOwn(object, prop) && object[prop] === value) {
      return getParticipant(prop);
    }
  }
  return "";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    point: {
      radius: 5,
    },
    line: {
      borderWidth: 0,
    },
  },
  scales: {
    x: {
      type: "time",
      time: {
        unit: "day",
      },
    },
    y: {
      offset: true,
      min: 0,
      max: Object.keys(store.tokenMap).length > 0 ? Object.keys(store.tokenMap).length - 1 : undefined,
      ticks: {
        stepSize: 1,
        callback: function (value, index) {
          return findKeyByValue(store.tokenMap, index);
        },
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: TooltipItem<"line">) {
          return (context.raw as any)?.tooltip || "NO DATA";
        },
      },
    },
  },
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
};
