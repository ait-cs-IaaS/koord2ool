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
  // showLine: true,
  // elements: {
  //   point: {
  //     hitRadius: 40,
  //     pointStyle: "circle",
  //     hoverRadius: 10,
  //     radius: 0,
  //     borderWidth: 2,
  //     hoverBorderWidth: 2,
  //   },
  //   line: {
  //     fill: true,
  //     borderWidth: 5,
  //     tension: 0.0,
  //     borderCapStyle: "round",
  //   },
  // },
  // plugins: {
  //   filler: {
  //     propagate: true,
  //   },
  //   legend: {
  //     display: false,
  //     position: "top",
  //     align: "center",
  //     maxWidth: 200,
  //   },
  //   tooltip: {
  //     backgroundColor: "#FFFFFF",
  //     titleColor: "#575757",
  //     bodyColor: "#575757",
  //     padding: 12,
  //     caretSize: 0,
  //     cornerRadius: 1,
  //     boxPadding: 5,
  //     borderColor: "#A4A4A4",
  //     borderWidth: 1,
  //     position: "average",
  //     callbacks: {
  //       label: function (context) {
  //         return context.formattedValue;
  //       },
  //     },
  //   },
  // },
} as ChartOptions<"line">;
