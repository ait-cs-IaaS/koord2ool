<template>
  <div class="time-slider">
    <b-form-input
      type="range"
      :min="minRange"
      :max="maxRange"
      :step="step"
      :disabled="disabled"
      :readonly="disabled"
      @input="emitUpdate"
    ></b-form-input>
    <div class="text-muted text-right small">
      {{ label }}
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({})
export default class TimeSlider extends Vue {
  @Prop({ type: Boolean, default: () => false })
  disabled!: boolean;

  @Prop({ type: Date, required: false })
  min?: Date;

  private get minRange(): number {
    return this.min ? this.min.valueOf() : 0;
  }

  @Prop({ type: Date, required: false })
  max?: Date;

  private get maxRange(): number {
    return this.max ? this.max.valueOf() : 1;
  }

  @Prop({ type: Date, required: false })
  value?: Date;

  @Prop({ type: Number, default: () => 1000 * 60 * 30 }) // 30 minutes
  step!: number;

  get label(): string {
    if (typeof this.value !== "undefined") {
      return this.value.toISOString();
    }
    return "";
  }

  protected emitUpdate(value?: Date | string | number): void {
    if (typeof value === "string") {
      value = /^\d+$/i.test(value) ? new Date(Number(value)) : new Date(value);
    } else if (typeof value === "number") {
      value = new Date(value);
    }

    this.$emit("input", value);
  }
}
</script>
