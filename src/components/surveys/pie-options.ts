import { ChartOptions } from "chart.js";

export const chartOptions: ChartOptions<"pie"> = {
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      align: "center",
    },
  },
};
