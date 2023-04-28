import { ChartOptions } from "chart.js";

export const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    x: {
      type: "time",
      time: {
        unit: "day",
      },
    },
  },
  plugins: {
    filler: {
      propagate: true,
    },
    legend: {
      position: "top",
      align: "center",
      maxWidth: 200,
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
};
