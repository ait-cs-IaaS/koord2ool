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
      :interval="3600 * 24"
      :marks="true"
      :hide-label="true"
      :lazy="true"
      class="mx-5 mt-5 mb-5 pb-4 text-primary"
    ></vue-slider>
    {{ range }}
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/antd.css";

@Component({
  components: {
    VueSlider,
  },
})
export default class TimeSlider extends Vue {
  @Prop({ type: Date, required: true })
  minDate!: Date;

  @Prop({ type: Date, required: true })
  maxDate!: Date;

  getMidnight(date: Date): Date {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  }
  getMidnightTomrrow(date: Date): Date {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    );
  }
  get min(): number {
    return Math.round(this.getMidnight(this.minDate).getTime() / 1000);
  }

  get max(): number {
    return Math.round(this.getMidnightTomrrow(this.maxDate).getTime() / 1000);
  }

  get range(): [number, number] {
    return [this.min - 1, this.max + 1];
  }
  set range(range: [number, number]) {
    this.$emit("input", [new Date(range[0] * 1000), new Date(range[1] * 1000)]);
  }

  get step(): number {
    const stepSize = this.$store.getters.getStep;
    return stepSize * 3600;
  }

  tooltipFormater = (value: number): string => {
    return new Date(value * 1000).toUTCString();
  };
}
</script>
