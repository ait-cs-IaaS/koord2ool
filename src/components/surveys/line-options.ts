import { ChartOptions } from "chart.js";

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
      mode: "index",
      intersect: false,
    },
  },
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
};
