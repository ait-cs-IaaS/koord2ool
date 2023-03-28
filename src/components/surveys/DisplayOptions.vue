<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title class="ml-1">
        <v-icon>mdi-cog</v-icon>
        Display Options
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-col v-for="(option, optionKey) in options" :key="optionKey">
          <v-btn-toggle
            :model-value="(settings as any)[optionKey]"
            @update:modelValue="updateResult(optionKey, $event)"
            color="primary"
            mandatory
            :divided="true"
            rounded
          >
            <div v-for="o in option" :key="o.text">
              <v-tooltip v-if="o.description" :text="o.description" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" :prepend-icon="o.icon" :value="o.value" class="pt-2 pb-2">
                    {{ o.text }}
                  </v-btn>
                </template>
              </v-tooltip>
              <v-btn v-else :prepend-icon="o.icon" :value="o.value" class="pt-2 pb-2">
                {{ o.text }}
              </v-btn>
            </div>
          </v-btn-toggle>
        </v-col>
        <slot name="additional-options" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { koordStore } from "../../store";
import { SettingsKey, Option } from "../../store/settings.model";

export default defineComponent({
  name: "DisplayOptions",
  props: {
    displayOptions: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object as () => Record<SettingsKey, Option[]>,
      default: () => ({} as Record<SettingsKey, Option[]>),
    },
  },
  computed: {
    ...mapState(koordStore, ["settings"]),
  },
  data() {
    return {
      display: this.displayOptions,
    };
  },
  methods: {
    updateResult(key: SettingsKey, result: boolean | number) {
      (this.settings as any)[key] = result;
    },
  },
});
</script>
