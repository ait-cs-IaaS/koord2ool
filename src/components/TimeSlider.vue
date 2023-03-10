<template>
  <div>
    <h4>
      <b>Set range</b>
    </h4>
    <vue-slider
      v-model="range"
      :enable-cross="false"
      :tooltip="'always'"
      tooltip-placement="top"
      :tooltip-formatter="tooltipFormater"
      :min="min"
      :max="max"
      :absorb="true"
      :interval="step"
      :marks="true"
      :hide-label="true"
      :lazy="true"
      class="mx-5 mt-5 mb-5 pb-4 text-primary"
    ></vue-slider>
  </div>
</template>

<script lang="ts">
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/antd.css";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TimeSlider",
  components: {
    VueSlider,
  },
  props: {
    minDate: {
      type: Date,
      required: true,
    },
    maxDate: {
      type: Date,
      required: true,
    },
  },
  data() {
    return {
      step: 86400,
    };
  },
  computed: {
    min(): number {
      return Math.round(this.getMidnight(this.minDate).getTime() / 1000);
    },
    max(): number {
      return Math.round(this.getMidnightTomrrow(this.maxDate).getTime() / 1000);
    },
    range(): [number, number] {
      return [this.min, this.max];
    },
  },
  methods: {
    tooltipFormater(value: number): string {
      return new Date(value * 1000).toUTCString();
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
