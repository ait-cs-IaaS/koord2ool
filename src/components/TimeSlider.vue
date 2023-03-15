<template>
  <Slider v-model="range" :min="minValue" :max="maxValue" :format="tooltipFormater" />
</template>

<style src="@vueform/slider/themes/default.css"></style>

<script lang="ts">
import Slider from "@vueform/slider";
import { defineComponent } from "vue";

interface rangeArray extends Array<Date> {
  length: 2;
}

export default defineComponent({
  name: "TimeSlider",
  components: {
    Slider,
  },
  emits: ["update:inputRange"],
  props: {
    minDate: {
      type: Date,
      required: true,
    },
    maxDate: {
      type: Date,
      required: true,
    },
    inputRange: {
      type: Array as () => rangeArray,
      required: true
    }
  },
  data: function () {
    return {
      step: 86400,
      minValue: Math.round(this.getMidnight(this.minDate).getTime()),
      maxValue: Math.round(this.getMidnightTomrrow(this.maxDate).getTime()),
    };
  },
  computed: {
    range: {
      get(): [number, number] {
        return [this.inputRange[0].getTime(), this.inputRange[1].getTime()]
      },
      set(value: [number, number]) {
        const result = [new Date(value[0]), new Date(value[1])];
        console.debug("TimeSlider: range changed", result)
        this.$emit("update:inputRange", result);
      }
    },
  },
  methods: {
    tooltipFormater(value: number): string {
      return new Date(value).toUTCString();
    },
    getMidnight(date: Date): Date {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );
    },
    getMidnightTomrrow(date: Date): Date {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      );
    },
  },
});
</script>
