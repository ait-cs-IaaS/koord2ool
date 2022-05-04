<template>
  <b-form-group class="time-slider" label="Show until" :label-for="id">
    <template #description>
      <div class="text-lg-right">
        {{ label }}
      </div>
    </template>
    <b-form-input
      type="range"
      :id="id"
      :min="minRange"
      :max="maxRange"
      :step="step"
      :value="valueAsNumber"
      :disabled="disabled"
      :readonly="disabled"
      @input="emitUpdate"
    ></b-form-input>
  </b-form-group>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { v4 } from "uuid";

@Component({})
export default class TimeSlider extends Vue {
  @Prop({ type: String, default: () => `timeslider-${v4()}` })
  id!: string;

  @Prop({ type: Boolean, default: () => false })
  disabled!: boolean;

  @Prop({ type: Date, required: false })
  min?: Date;

  private get minRange(): number {
    return typeof this.min !== "undefined" ? this.min.valueOf() : 0;
  }

  @Prop({ type: Date, required: false })
  max?: Date;

  private get maxRange(): number {
    return typeof this.max !== "undefined" ? this.max.valueOf() : 1;
  }

  @Prop({ type: Date, required: false })
  value?: Date;

  private get valueAsNumber(): number {
    return typeof this.value !== "undefined" ? this.value.valueOf() : 0;
  }

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
