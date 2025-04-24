import { ChartOptions, TooltipItem } from "chart.js";
import { useSurveyStore } from "../../store/surveyStore";
import { getParticipant, getQuestionText } from "../../helpers/chartFunctions";
import { CandlestickPoint } from "../../helpers/chart-types";

const store = useSurveyStore();

const fontConfig = {
  titleSize: 16,
  axisTitleSize: 14,
  tickLabelSize: 12,
  tooltipSize: 13,
};

export const doughnutChartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: true,
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
      display: false,
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
      display: false,
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

export const pieChartOptions: ChartOptions<"pie"> = {
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      align: "center",
    },
  },
};

export const histogramChartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Number of Responses",
        font: {
          weight: "bold",
          size: 12,
        },
      },
      ticks: {
        precision: 0,
      },
    },
    x: {
      title: {
        display: true,
        text: "Values",
        font: {
          weight: "bold",
          size: 12,
        },
      },
      ticks: {
        font: {
          size: 10,
        },
        minRotation: 0,
        maxRotation: 0,
      },
    },
  },
};

type CandlestickChartOptions = ChartOptions<"candlestick"> & {
  elements?: {
    candlestick?: {
      color?: {
        up?: string;
        down?: string;
        unchanged?: string;
      };
      borderWidth?: number;
    };
  };
};

export const candlestickChartOptions: CandlestickChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    candlestick: {
      color: {
        up: "rgba(75, 192, 192, 1)",
        down: "rgba(255, 99, 132, 1)",
        unchanged: "rgba(150, 150, 150, 1)",
      },
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      offset: true,
      type: "time",
      time: { unit: "day" },
      title: {
        display: true,
        text: "Date",
        font: {
          size: fontConfig.axisTitleSize,
          weight: "bold",
        },
      },
      ticks: {
        font: { size: fontConfig.tickLabelSize },
        major: {
          enabled: false,
        },
        maxRotation: 45,
        autoSkip: true,
        autoSkipPadding: 0,
        sampleSize: 10,
      },
    },
    y: {
      title: {
        display: true,
        text: "Value",
        font: {
          size: fontConfig.axisTitleSize,
          weight: "bold",
        },
      },
      ticks: {
        font: { size: fontConfig.tickLabelSize },
        callback: function formatYAxisTick(value) {
          return Number(value).toFixed(1);
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
    legend: { display: false },
    tooltip: {
      titleFont: { size: fontConfig.tooltipSize },
      bodyFont: { size: fontConfig.tooltipSize },
      intersect: false,
      mode: "index",
      displayColors: false,
      callbacks: {
        label(ctx: TooltipItem<"candlestick">) {
          const point = ctx.parsed as CandlestickPoint;
          const dataPoint = ctx.dataset.data[ctx.dataIndex] as CandlestickPoint;

          const tooltipLabels = [
            `Date: ${new Date(dataPoint.x).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}`,
            `Active responses: ${dataPoint.count}`,
          ];

          if (dataPoint.m !== undefined) tooltipLabels.push(`Median: ${dataPoint.m.toFixed(2)}`);
          if (dataPoint.a !== undefined) tooltipLabels.push(`Average: ${dataPoint.a.toFixed(2)}`);

          tooltipLabels.push(
            `Range: ${point.l.toFixed(2)} - ${point.h.toFixed(2)}`,
            `First: ${point.o.toFixed(2)}`,
            `Last: ${point.c.toFixed(2)}`,
            `Change: ${(point.c - point.o).toFixed(2)}`,
          );

          if (dataPoint.tokens?.length) {
            tooltipLabels.push("", "Active participants:");
            const participants = dataPoint.tokens.slice(0, 5).map(getParticipant);
            tooltipLabels.push(...participants);

            if (dataPoint.tokens.length > 5) {
              tooltipLabels.push(`...and ${dataPoint.tokens.length - 5} more`);
            }
          }

          return tooltipLabels;
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
