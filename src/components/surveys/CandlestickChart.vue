<template>
  <candle-chart v-if="renderChart" :data="processedChartData" :style="chartStyle" :options="chartOptions" :plugins="chartPlugins" />
</template>

<script lang="ts">
import { Chart as ChartJS, ChartOptions, ChartData, FinancialDataPoint, TooltipItem, Plugin } from "chart.js";
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from "chartjs-chart-financial";
import { createTypedChart } from "vue-chartjs";
import { defineComponent, ref, onMounted, nextTick, computed, watch } from "vue";
import "chartjs-adapter-moment";
import { useSurveyStore } from "../../store/surveyStore";
import { getParticipant } from "../../helpers/chartFunctions";
const CandleChart = createTypedChart("candlestick", CandlestickElement);

ChartJS.register(CandlestickController, CandlestickElement, OhlcController, OhlcElement);

import * as FinancialElements from "chartjs-chart-financial";

const CandlestickElementPrototype = (FinancialElements.CandlestickElement as any).prototype;
const originalDraw = CandlestickElementPrototype.draw;

CandlestickElementPrototype.draw = function (ctx: CanvasRenderingContext2D) {
  const { open, high, low, close, x, width, y } = this;
  const isFlat = open === high && high === low && low === close;

  if (isFlat) {
    ctx.save();
    ctx.strokeStyle = "rgba(75, 192, 192, 1)";
    ctx.fillStyle = "rgba(75, 192, 192, 0.2)";
    ctx.lineWidth = 1.5;
    const minHeight = 5;
    const yTop = y - minHeight / 2;
    ctx.beginPath();
    ctx.rect(x - width / 2, yTop, width, minHeight);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else {
    originalDraw.call(this, ctx);
  }
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


const medianLinesPlugin: Plugin = {
  id: "medianLines",
  afterDatasetsDraw: (chart) => {
    const { ctx, chartArea, scales } = chart;
    if (!scales.x || !scales.y || !chart.data.datasets[0]) return;

    const dataset = chart.data.datasets[0];

    ctx.save();
    ctx.lineWidth = 1.5; 
    ctx.strokeStyle = "rgba(0, 0, 0, 1)"; 
    ctx.setLineDash([]); 

    dataset.data.forEach((data: any) => {
      if (!data || typeof data !== "object" || !("m" in data) || !("x" in data)) return;

      const x = scales.x.getPixelForValue(data.x);
      const y = scales.y.getPixelForValue(data.m);

      if (x >= chartArea.left && x <= chartArea.right && y >= chartArea.top && y <= chartArea.bottom) {
        const candleWidth = 8; 

        ctx.beginPath();
        ctx.moveTo(x - candleWidth / 2, y);
        ctx.lineTo(x + candleWidth / 2, y);
        ctx.stroke();
      }
    });

    ctx.restore();
  },
};

const activeCountColorPlugin: Plugin = {
  id: "activeCountColor",
  beforeDatasetsDraw: (chart) => {
    const { chartArea, scales } = chart;
    if (!scales.x || !scales.y || !chart.data.datasets[0]) return;

    const dataset = chart.data.datasets[0];
    
    let maxCount = 0;
    dataset.data.forEach((data: any) => {
      if (data && typeof data === "object" && "count" in data) {
        maxCount = Math.max(maxCount, data.count);
      }
    });
    
    if (maxCount === 0) return;
    
    dataset.data.forEach((data: any, index: number) => {
      if (!data || typeof data !== "object" || !("count" in data)) return;
      
      const intensity = data.count / maxCount;
      const alpha = 0.3 + (intensity * 0.7); 
      const element = chart.getDatasetMeta(0).data[index];
      if (element) {
        element.options = element.options || {};
        element.options.color = {
          up: `rgba(75, 192, 192, ${alpha})`,
          down: `rgba(255, 99, 132, ${alpha})`,
          unchanged: `rgba(50, 50, 50, ${alpha})`
        };
      }
    });
  }
};

const averageLinePlugin: Plugin = {
  id: "averageLine",
  afterDatasetsDraw: (chart) => {
    const { ctx, chartArea, scales } = chart;
    if (!scales.x || !scales.y || !chart.data.datasets[0]) return;

    const dataset = chart.data.datasets[0];

    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(75, 192, 192, 0.7)";
    ctx.setLineDash([3, 3]);

    dataset.data.forEach((data: any) => {
      if (!data || typeof data !== "object" || !("a" in data) || !("x" in data)) return;

      const x = scales.x.getPixelForValue(data.x);
      const y = scales.y.getPixelForValue(data.a);

      if (x >= chartArea.left && x <= chartArea.right && y >= chartArea.top && y <= chartArea.bottom) {
        const candleWidth = 8;

        ctx.beginPath();
        ctx.moveTo(x - candleWidth / 2, y);
        ctx.lineTo(x + candleWidth / 2, y);
        ctx.stroke();
      }
    });

    ctx.restore();
  },
};

export default defineComponent({
  name: "CandleStickChartComponent",
  components: {
    CandleChart,
  },
  props: {
    chartjsData: {
      type: Object as () => ChartData<"candlestick">,
      required: true,
    },
    questionKey: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const renderChart = ref(false);
    const store = useSurveyStore();
    const chartStyle = {
      width: "100%",
      height: "100%",
    };

    const processedChartData = computed(() => {
      if (!props.chartjsData || !props.chartjsData.datasets || props.chartjsData.datasets.length === 0) {
        return props.chartjsData;
      }

      const newData = JSON.parse(JSON.stringify(props.chartjsData));
      return newData;
    });

    const chartPlugins = [medianLinesPlugin, averageLinePlugin, activeCountColorPlugin];

    watch(
      () => props.chartjsData,
      (newData) => {
        console.debug("Candlestick data updated:", newData);
        if (newData?.datasets?.length) {
          const dataset = newData.datasets[0];
          if (dataset.data?.length > 0) {
            console.debug("Sample data point:", dataset.data[0]);
          }
        }
      },
      { deep: true, immediate: true },
    );

    const minmax = computed(() => {
      const result = store.minMaxFromDataset?.[props.questionKey];
      return result;
    });

    const formatYAxisTick = (value: string | number, index: number, ticks: Array<{ value: number }>) => {
      if (index === ticks.length - 1) {
        return null;
      }
      return value;
    };

    const formatTooltipTitle = (items: any[]) => {
      if (!items || items.length === 0) return '';
      const date = new Date(items[0].parsed.x);
      return date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    };

    const chartOptions = computed((): CandlestickChartOptions => {
      return {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          candlestick: {
            color: {
              up: "rgba(75, 192, 192, 1)",
              down: "rgba(255, 99, 132, 1)",
              unchanged: "rgba(50, 50, 50, 1)",
            },
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
              displayFormats: {
                day: "MMM D",
              },
            },
            title: {
              display: true,
              text: "Date",
              font: { size: 10, weight: "bold" },
              padding: { top: 0 },
            },
            adapters: {
              date: {
                locale: "en",
              },
            },
            ticks: {
              font: { size: 9 },
              maxRotation: 0,
              maxTicksLimit: 8,
            },
            grid: { display: false },
          },
          y: {
            min: minmax.value?.min || 0,
            max: minmax.value?.max || 200,
            title: {
              display: true,
              text: "Value",
              font: { size: 10, weight: "bold" },
              padding: { bottom: 0 },
            },
            ticks: {
              font: { size: 9 },
              maxTicksLimit: 5,
              callback: formatYAxisTick,
              padding: 8,
            },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: { size: 11 },
            bodyFont: { size: 11 },
            intersect: false,
            mode: "index" as const,
            displayColors: false,
            callbacks: {
              title: formatTooltipTitle,
              label(ctx: TooltipItem<"candlestick">) {
                const point = ctx.parsed as any;
                const dataPoint = ctx.dataset.data[ctx.dataIndex] as any;
                const tooltipLabels = [];
                
                tooltipLabels.push(`Active responses: ${dataPoint.count}`);
                
                if ('m' in dataPoint) {
                  tooltipLabels.push(`Median: ${dataPoint.m}`);
                }
                
                if ('a' in dataPoint) {
                  tooltipLabels.push(`Average: ${dataPoint.a}`);
                }
                
                tooltipLabels.push(
                  `Range: ${point.l} - ${point.h}`,
                  `First: ${point.o}`,
                  `Last: ${point.c}`
                );
                
                if (dataPoint.tokens && dataPoint.tokens.length > 0) {
                  tooltipLabels.push('');
                  tooltipLabels.push('Active participants:');
                  const maxParticipantsToShow = 5;
                  const participants = dataPoint.tokens.slice(0, maxParticipantsToShow).map((token: string) => {
                    return getParticipant(token);
                  });
                  
                  tooltipLabels.push(...participants);
                  
                  if (dataPoint.tokens.length > maxParticipantsToShow) {
                    tooltipLabels.push(`...and ${dataPoint.tokens.length - maxParticipantsToShow} more`);
                  }
                }
                
                return tooltipLabels;
              },
            },
          },
        },
        layout: {
          padding: {
            left: 2,
            right: 10,
            top: 20,
            bottom: 10,
          },
        },
      };
    });

    onMounted(async () => {
      try {
        await nextTick();
        renderChart.value = true;
      } catch (error) {
        console.error("Error rendering candlestick chart:", error);
      }
    });

    return { chartStyle, renderChart, chartOptions, chartPlugins, processedChartData };
  },
});
</script>
<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
