<template>
  <v-collapse v-model="display">
    <v-card class="mb-4 px-1 display-options-container shadow">
      <b-form-checkbox switch size="lg" v-model="result" class="pointer">
        <span class="display-option"> {{ optionText }} <br /></span>
        <span class="display-option-description">
          {{ optionDescription }}
        </span>
      </b-form-checkbox>
    </v-card>
  </v-collapse>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DisplayOptions",
  props: {
    displayOptions: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array as () => {
        text: string;
        value: boolean;
        description: string;
      }[],
      default: () => [],
    },
  },
  emits: ["result"],
  data() {
    return {
      xResult: false,
      display: this.displayOptions,
    };
  },
  computed: {
    result: {
      get(): boolean {
        return this.xResult;
      },
      set(result: boolean) {
        this.xResult = result;
        this.$emit("result", result);
      },
    },
    optionDescription(): string {
      const value = this.options.find(
        (option: { text: string; value: boolean; description: string }) =>
          option.value === this.result
      );
      return typeof value !== "undefined" ? value.description : "";
    },
    optionText(): string {
      const value = this.options.find(
        (option: { text: string; value: boolean; description: string }) =>
          option.value === this.result
      );
      return typeof value !== "undefined" ? value.text : "";
    },
  },
});
</script>
