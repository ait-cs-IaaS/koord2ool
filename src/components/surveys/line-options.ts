import { ChartOptions } from "chart.js";

export const chartOptions: ChartOptions<"line"> = {
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
};
