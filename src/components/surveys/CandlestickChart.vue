<template>
  <candle-chart v-if="renderChart" :data="processedChartData" :style="chartStyle" :options="chartOptions" :plugins="chartPlugins" />
</template>

<script lang="ts">
import { Chart as ChartJS, ChartData, Plugin, FinancialDataPoint } from "chart.js";
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from "chartjs-chart-financial";
import { createTypedChart } from "vue-chartjs";
import { defineComponent, ref, onMounted, nextTick, computed } from "vue";
import "chartjs-adapter-moment";
import { candlestickChartOptions } from "./chart-options";

const CandleChart = createTypedChart("candlestick", CandlestickElement);

ChartJS.register(CandlestickController, CandlestickElement, OhlcController, OhlcElement);

type CandlestickPoint = FinancialDataPoint & {
  x: number;
  o: number;
  h: number;
  l: number;
  c: number;
  m?: number;
  a?: number;
  count?: number;
  tokens?: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CandlestickElementPrototype = (CandlestickElement as unknown as { prototype: any }).prototype;
const originalDraw = CandlestickElementPrototype.draw;

CandlestickElementPrototype.draw = function (ctx: CanvasRenderingContext2D) {
  const { open, high, low, close, x, width, y } = this;
  const isFlat = open === high && high === low && low === close;

  const options = this.options || {};
  const isPositive = close - open >= 0;

  const customColors = options.color || {};

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
    if (customColors.up && customColors.down) {
      this.options.color = isPositive ? customColors.up : customColors.down;
    }
    originalDraw.call(this, ctx);
  }
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

    dataset.data.forEach((d) => {
      const data = d as CandlestickPoint;
      if (!data || data.m === undefined || data.x === undefined) return;

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

    dataset.data.forEach((d) => {
      const data = d as CandlestickPoint;
      if (!data || data.a === undefined || data.x === undefined) return;

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

const enhancedColorPlugin: Plugin = {
  id: "enhancedColor",
  beforeDatasetsDraw: (chart) => {
    const { scales } = chart;
    if (!scales.x || !scales.y || !chart.data.datasets[0]) return;

    const dataset = chart.data.datasets[0];

    let maxCount = 0;
    dataset.data.forEach((d) => {
      const data = d as CandlestickPoint;
      if (data?.count !== undefined) {
        maxCount = Math.max(maxCount, data.count);
      }
    });

    if (maxCount === 0) return;

    dataset.data.forEach((d, index) => {
      const data = d as CandlestickPoint;
      if (data?.count === undefined) return;

      const intensity = data.count / maxCount;
      const alpha = 0.3 + intensity * 0.7;

      const element = chart.getDatasetMeta(0).data[index];
      if (element) {
        element.options = element.options || {};
        element.options.color = {
          up: `rgba(75, 192, 192, ${alpha})`,
          down: `rgba(255, 99, 132, ${alpha})`,
          unchanged: `rgba(150, 150, 150, ${alpha})`,
        };
      }
    });
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
    const chartStyle = {
      position: "relative",
      width: "100%",
      height: "300px",
    };

    const processedChartData = computed(() => {
      if (!props.chartjsData?.datasets?.length) return props.chartjsData;
      return JSON.parse(JSON.stringify(props.chartjsData));
    });

    const chartPlugins = [medianLinesPlugin, averageLinePlugin, enhancedColorPlugin];

    onMounted(async () => {
      try {
        await nextTick();
        renderChart.value = true;
      } catch (error) {
        console.error("Error rendering candlestick chart:", error);
      }
    });

    return { chartStyle, renderChart, chartOptions: candlestickChartOptions, chartPlugins, processedChartData };
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
