export const areaChartOptions = {
  chart: {
    type: "area",
    stacked: true,
    stackType: "normal",
  },
  colors: ["#D22B2B", "#0BDA51", "#CED4DC"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "stepline",
  },
  fill: {
    type: "solid",
    gradient: {
      opacityFrom: 0.6,
      opacityTo: 0.8,
    },
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
  },
  xaxis: {
    type: "datetime",
  },
};
