import { ChartData } from "chart.js";

export interface HistogramBin {
  value: number;
  count: number;
  label: string;
  percentage: string;
}

export interface HistogramDataset {
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  label: string;
  barPercentage: number;
  categoryPercentage: number;
  originalData?: HistogramBin[];
}

export interface HistogramChartData extends ChartData<"bar"> {
  labels: string[];
  datasets: HistogramDataset[];
  title?: string;
  subtitle?: string;
}

export type StrictChartData = ChartData<"bar", number[], string>;

export function toChartJsData(data: HistogramChartData): StrictChartData {
  return {
    labels: data.labels,
    datasets: data.datasets.map((ds) => ({
      data: ds.data,
      backgroundColor: ds.backgroundColor,
      borderColor: ds.borderColor,
      borderWidth: ds.borderWidth,
      label: ds.label,
      barPercentage: ds.barPercentage,
      categoryPercentage: ds.categoryPercentage,
    })),
  };
}

export const defaultHistogramData: HistogramChartData = {
  labels: [],
  datasets: [],
  title: "No data available",
  subtitle: "",
};

export interface TabularViewHeader {
  title: string;
  key: string;
  align: "start" | "end";
  sortable: boolean;
}
