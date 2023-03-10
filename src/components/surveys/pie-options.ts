import { ChartOptions } from "chart.js";

/**
 * These are options used by all pie charts in the application.
 *
 * @see {@link PieChartComponent}
 */
export const chartOptions = {
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      align: "center",
    },
  },
} as ChartOptions<"pie">;
