<template>
  <b-form-group class="time-slider" :label-for="id">
    <h4>
      <b>Set range</b>
    </h4>
    <v-range-slider
      v-model="range"
      :min="minDate"
      :max="maxDate"
      :step="step"
    />
  </b-form-group>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { v4 } from "uuid";

@Component({
  components: {},
})
export default class TimeSlider extends Vue {
  @Prop({ type: String, default: () => `timeslider-${v4()}` })
  id!: string;

  @Prop({ type: Date, required: false })
  minDate?: Date;

  @Prop({ type: Date, required: false })
  maxDate?: Date;

  range: [Date, Date] = [new Date(), new Date()];
  step: number = 6 * 60 * 60 * 1000;

  protected emitUpdate(range?: [number, number]): void {
    if (typeof range !== "undefined") {
      this.$emit("input", [new Date(range[0]), new Date(range[1])]);
    }
  }
}
</script>
