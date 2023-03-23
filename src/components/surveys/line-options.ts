import { ChartOptions } from "chart.js";

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    x: {
      type: "time",
      time: {
        unit: "day",
      }
    }
  }
} as ChartOptions<"line">;
