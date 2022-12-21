<template>
  <b-collapse v-model="displayOptions">
    <b-card class="mb-4 px-1 display-options-container shadow">
      <b-form-checkbox switch size="lg" v-model="result" class="pointer">
        <span class="display-option"> {{ optionText }} <br /></span>
        <span class="display-option-description">
          {{ optionDescription }}
        </span>
      </b-form-checkbox>
    </b-card>
  </b-collapse>
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";

@Component({
  components: {},
})
export default class Survey extends Vue {
  @Prop({ type: Boolean, default: false })
  displayOptions!: boolean;

  @Prop({ type: Array, default: [] })
  options!: { text: string; value: boolean; description: string }[];

  xResult = false;

  get result(): boolean {
    return this.xResult;
  }

  set result(result: boolean) {
    this.xResult = result;
    this.$emit("result", result);
  }

  get optionDescription(): string {
    const value = this.options.find((option) => option.value === this.result);
    return typeof value !== "undefined" ? value.description : "";
  }

  get optionText(): string {
    const value = this.options.find((option) => option.value === this.result);
    return typeof value !== "undefined" ? value.text : "";
  }
}
</script>
