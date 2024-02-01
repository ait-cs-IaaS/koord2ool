<template>
  <apexchart
    v-if="renderChart"
    class="mt-5"
    width="800"
    type="area"
    :options="areaChartOptions"
    :series="chartData"
  />
</template>

<script lang="ts">
import { lineChartOptions, areaChartOptions } from "./line-options";
import { defineComponent, ref } from "vue";
import { onMounted } from "vue";
import { nextTick } from "vue";
import { ChartDataEntry } from "../../helpers/chartFunctions";

export default defineComponent({
  name: "AreaChartComponent",
  props: {
    chartData: {
      type: Array as () => ChartDataEntry[],
      required: true,
    },
    questionType: { type: String, default: "" },
  },
  setup() {
    const renderChart = ref(false);

    const chartStyle = {
      width: "100%",
    };

    onMounted(async () => {
      await nextTick();
      renderChart.value = true;
    });

    return { chartStyle, renderChart, lineChartOptions, areaChartOptions };
  },
});
</script>
