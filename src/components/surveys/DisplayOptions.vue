<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>
        <v-icon>mdi-cog</v-icon>
        Display Options
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-btn-toggle v-model="result" color="primary" mandatory rounded>
          <v-tooltip
            v-for="option in options"
            :key="option.text"
            :text="option.description"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                :prepend-icon="option.icon"
                :value="option.value"
              >
                {{ option.text }}
              </v-btn>
            </template>
          </v-tooltip>
        </v-btn-toggle>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
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
        icon: string;
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
  },
});
</script>
