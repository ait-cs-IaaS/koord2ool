<template>
  <b-form-group class="time-slider" :label-for="id">
    <h4>
      <b>Set range</b>
    </h4>
    <vue-slider
      v-model="range"
      :id="id"
      :enable-cross="false"
      :tooltip="'always'"
      :tooltip-placement="['bottom', 'top']"
      :tooltip-formatter="tooltipFormater"
      :min="minRange"
      :max="maxRange"
      :absorb="true"
      :marks="true"
      :interval="1000 * 3600 * 24"
      :hide-label="true"
      :lazy="true"
      class="mx-5 mt-5 mb-5 pb-4 text-primary"
      @change="emitUpdate"
    ></vue-slider>
  </b-form-group>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { v4 } from "uuid";
import VueSlider from "vue-slider-component";
import moment from "moment";
import "vue-slider-component/theme/antd.css";

@Component({
  components: {
    VueSlider,
  },
})
export default class TimeSlider extends Vue {
  @Prop({ type: String, default: () => `timeslider-${v4()}` })
  id!: string;

  @Prop({ type: Date, required: false })
  min?: Date;

  private get minRange(): number {
    return typeof this.min !== "undefined"
      ? this.min.setHours(0, 0, 0, 0).valueOf()
      : 0;
  }

  @Prop({ type: Date, required: false })
  max?: Date;

  private get maxRange(): number {
    return typeof this.max !== "undefined"
      ? this.max.setHours(0, 0, 0, 0).valueOf() + 1000 * 3600 * 24
      : 1;
  }

  get range(): [number, number] {
    // +/- 1 to trigger change event on edges
    return [this.minRange + 1, this.maxRange - 1];
  }

  tooltipFormater = (value: number): string => {
    var label = moment.unix(value / 1000).format("MM/DD/YYYY");
    return label;
  };

  protected emitUpdate(range?: [number, number]): void {
    if (typeof range !== "undefined") {
      this.$emit("input", [new Date(range[0]), new Date(range[1])]);
    }
  }
}
</script>
