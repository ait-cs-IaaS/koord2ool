<template>
  <v-card class="mb-4 px-1 display-options-container shadow">
    <v-switch
      v-model="result"
      class="pointer"
      label-class="display-option"
      size="lg"
    >
      <template #label>
        {{ optionText }}<br />
        <span class="display-option-description">
          {{ optionDescription }}
        </span>
      </template>
    </v-switch>
  </v-card>
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
