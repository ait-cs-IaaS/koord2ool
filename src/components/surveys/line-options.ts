import { ChartOptions, TooltipItem } from "chart.js";
import { useSurveyStore } from "../../store/surveyStore";
import { getParticipant, getQuestionText } from "../../helpers/chartFunctions";

const store = useSurveyStore();

const fontConfig = {
  titleSize: 16,
  axisTitleSize: 14,
  tickLabelSize: 12,
  tooltipSize: 13,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const areaChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      offset: true,
      type: "time",
      time: {
        unit: "day",
      },
      title: {
        display: true,
        text: "Date",
        font: {
          size: fontConfig.axisTitleSize,
          weight: "bold",
        },
      },
      ticks: {
        font: {
          size: fontConfig.tickLabelSize,
        },
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      title: {
        display: true,
        text: "Responses",
        font: {
          size: fontConfig.axisTitleSize,
          weight: "bold",
        },
      },
      ticks: {
        stepSize: 1,
        font: {
          size: fontConfig.tickLabelSize,
        },
        callback: function (value) {
          return value;
        },
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: "", 
      padding: 20,
      font: {
        size: fontConfig.titleSize,
        weight: "bold",
      },
    },
    filler: {
      propagate: true,
    },
    legend: {
      display: true,
      position: "top",
      align: "center",
      maxWidth: 200,
      labels: {
        font: {
          size: fontConfig.tickLabelSize,
        },
      },
    },
    tooltip: {
      titleFont: {
        size: fontConfig.tooltipSize,
      },
      bodyFont: {
        size: fontConfig.tooltipSize,
      },
      callbacks: {
        label: function (context: TooltipItem<"line">) {
          return (context.raw as any)?.tooltip || `${context.dataset.label}: ${context.formattedValue}`;
        },
      },
    },
  },
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
};

function findKeyByValue(object: Record<string, number>, value: number): string {
  for (const prop in object) {
    if (Object.hasOwn(object, prop) && object[prop] === value) {
      return getParticipant(prop);
    }
  }
  return "";
}

export const updateChartOptions = (options: ChartOptions<"line">, questionKey: string): ChartOptions<"line"> => {
  const questionText = getQuestionText(questionKey);

  const updatedOptions = JSON.parse(JSON.stringify(options));

  if (updatedOptions.plugins?.title) {
    updatedOptions.plugins.title.text = questionText;
  }

  if (updatedOptions.scales?.y?.title) {
    updatedOptions.scales.y.title.text = "Responses";
  }

  return updatedOptions;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    point: {
      radius: 5,
    },
    line: {
      borderWidth: 0,
    },
  },
  scales: {
    x: {
      type: "time",
      time: {
        unit: "day",
      },
      title: {
        display: true,
        text: "Date",
        font: {
          size: fontConfig.axisTitleSize,
          weight: "bold",
        },
      },
      ticks: {
        font: {
          size: fontConfig.tickLabelSize,
        },
      },
    },
    y: {
      offset: true,
      min: 0,
      max: Object.keys(store.tokenMap).length > 0 ? Object.keys(store.tokenMap).length - 1 : undefined,
      title: {
        display: true,
        text: "Responses",
        font: {
          size: fontConfig.axisTitleSize,
          weight: "bold",
        },
      },
      ticks: {
        stepSize: 1,
        font: {
          size: fontConfig.tickLabelSize,
        },
        callback: function (value, index) {
          return findKeyByValue(store.tokenMap, index);
        },
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: "",
      padding: 20,
      font: {
        size: fontConfig.titleSize,
        weight: "bold",
      },
    },
    legend: {
      display: false,
    },
    tooltip: {
      titleFont: {
        size: fontConfig.tooltipSize,
      },
      bodyFont: {
        size: fontConfig.tooltipSize,
      },
      callbacks: {
        label: function (context: TooltipItem<"line">) {
          return (context.raw as any)?.tooltip || "NO DATA";
        },
      },
    },
  },
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
};
