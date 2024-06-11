import { ChartOptions, FinancialDataPoint, TooltipItem } from "chart.js";
import { koordStore } from "../../store";
import { getParticipant } from "../../helpers/chartFunctions";
const store = koordStore();

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
          return `${context.dataset.label}: ${context.formattedValue}`;
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
      min: 0,
      max:
        Object.keys(store.tokenMap).length > 0
          ? Object.keys(store.tokenMap).length - 1
          : undefined,
      ticks: {
        callback: function (value, index) {
          return findKeyByValue(store.tokenMap, index) || 0;
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

export const candlestickChartOptions: ChartOptions<"candlestick"> = {
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
      min: 0,
      max: 100,
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context: TooltipItem<"candlestick">) {
          const point = context.parsed as FinancialDataPoint;

          const { o, h, l, c } = point;

          return `O: ${o}  H: ${h}  L: ${l}  C: ${c}`;
        },
      },
    },
  },
};
