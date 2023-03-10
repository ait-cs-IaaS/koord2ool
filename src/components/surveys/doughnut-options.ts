// cutout: "80%",
// radius: "100%",
// rotation: 0,
// circumference: 360,
// offset: 0,
// animation: {
//   animateRotate: true,
//   animateScale: false,
// },
// plugins: {
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
//         // return "" + context.label + " " + context.formattedValue;
//         return context.formattedValue;
//       },
//     },
//   },
// },

export const chartData = {
  labels: ["VueJs", "EmberJs", "ReactJs", "AngularJs"],
  datasets: [
    {
      backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16"],
      data: [40, 20, 80, 10],
    },
  ],
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
};
