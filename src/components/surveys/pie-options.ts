import { ChartOptions } from "chart.js";

export default {
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      align: "center",
    },
  },
} as ChartOptions<"pie">;
