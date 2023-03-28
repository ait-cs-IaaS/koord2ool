<template>
  <Slider v-model="responseRange" :min="minValue" :max="maxValue" :step="stepSize" :format="tooltipFormater" />
</template>

<style src="@vueform/slider/themes/default.css"></style>

<script lang="ts">
import Slider from "@vueform/slider";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { koordStore } from "../store";

export default defineComponent({
  name: "TimeSlider",
  components: {
    Slider,
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapState(koordStore, ["settings", "responseRange", "getMaxResponseDate", "getMinResponseDate"]),

    minValue(): number {
      return Math.round(this.getMidnight(this.getMinResponseDate()).getTime());
    },

    maxValue(): number {
      return Math.round(this.getMidnightTomrrow(this.getMaxResponseDate()).getTime());
    },

    stepSize(): number {
      return this.settings.step * 3600 * 1000;
    },
  },
  methods: {
    tooltipFormater(value: number): string {
      const options : Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
      return new Date(value).toLocaleDateString('de-AT', options);
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
