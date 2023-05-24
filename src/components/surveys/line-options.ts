import { ChartOptions, TooltipItem } from "chart.js";
import { koordStore } from "../../store";
const store = koordStore();

export const areaChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: true,
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
          return Number.isInteger(value) ? value : 0;
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

export const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    x: {
      type: "time",
      time: {
        unit: "day",
      },
    },
    y: {
      min: 0,
      max: Object.keys(store.tokenMap).length - 1,
      ticks: {
        callback: function (value, index) {
          return store.tokenMap[index];
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
          const tooltip = (context.raw as any)?.tooltip || "NO DATA";
          return tooltip;
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
