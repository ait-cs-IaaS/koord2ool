<template>
  <Slider
    v-model="responseRange"
    :min="minValue"
    :max="maxValue"
    :step="stepSize"
    :format="tooltipFormater"
  />
</template>

<script lang="ts">
import Slider from "@vueform/slider";
import { mapWritableState, mapState } from "pinia";
import { defineComponent } from "vue";
import { koordStore } from "../store";
import { tooltipFormater } from "../helpers/slider";

export default defineComponent({
  name: "TimeSlider",
  components: {
    Slider,
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapState(koordStore, [
      "settings",
      "getMaxResponseDate",
      "getMinResponseDate",
    ]),
    ...mapWritableState(koordStore, ["responseRange"]),

    minValue(): number {
      return Math.round(this.getMidnight(this.getMinResponseDate()).getTime());
    },

    maxValue(): number {
      return Math.round(
        this.getMidnightTomrrow(this.getMaxResponseDate()).getTime(),
      );
    },

    stepSize(): number {
      return this.settings.step * 3600 * 1000;
    },
  },
  methods: {
    tooltipFormater(value: number): string {
      return tooltipFormater(value);
    },
    getMidnight(date: Date): Date {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      );
    },
    getMidnightTomrrow(date: Date): Date {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      );
    },
  },
});
</script>

<style src="@vueform/slider/themes/default.css"></style>
