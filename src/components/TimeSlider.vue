<template>
  <Slider v-model="responseRange" :min="minValue" :max="maxValue" :step="stepSize" :format="tooltipFormater" />
</template>

<script lang="ts">
import Slider from "@vueform/slider";
import { storeToRefs } from "pinia";
import { defineComponent, ref } from "vue";
import { useSurveyStore } from "../store/surveyStore";
import { tooltipFormater } from "../helpers/slider";

export default defineComponent({
  name: "TimeSlider",
  components: {
    Slider,
  },
  setup() {
    const store = useSurveyStore();

    const { settings, getMinResponseDate, getMaxResponseDate, responseRange } = storeToRefs(store);

    const minValue = ref(Math.round(getMidnight(getMinResponseDate.value).getTime()));
    const maxValue = ref(Math.round(getMidnightTomrrow(getMaxResponseDate.value).getTime()));
    const stepSize = ref(settings.value.step * 60 * 1000);

    function getMidnight(date: Date): Date {
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    function getMidnightTomrrow(date: Date): Date {
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1));
    }

    return {
      responseRange,
      minValue,
      maxValue,
      stepSize,
      tooltipFormater,
    };
  },
});
</script>

<style src="@vueform/slider/themes/default.css"></style>
