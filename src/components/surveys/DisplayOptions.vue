<template>
  <v-expansion-panels v-model="display">
    <v-expansion-panel value="config">
      <v-expansion-panel-title class="ml-1">
        <v-icon icon="mdi-cog" />
        Display Options
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row>
          <v-col v-for="(option, optionKey) in options" :key="optionKey" cols="6">
            <h3>
              {{ option.title }}
            </h3>
            <v-btn-toggle
              :model-value="(settings as any)[optionKey]"
              color="primary"
              mandatory
              :divided="true"
              rounded
              @update:model-value="updateResult(optionKey, $event)"
            >
              <div v-for="o in option.options" :key="o.text">
                <v-tooltip v-if="o.description" :text="o.description" location="top">
                  <template #activator="{ props }">
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
        </v-row>
        <slot name="additional-options" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { storeToRefs } from "pinia";
import { defineComponent, ref } from "vue";
import { useSurveyStore } from "../../store/surveyStore";
import { SettingsKey, SettingsOption } from "../../types/settings.model";

export default defineComponent({
  name: "DisplayOptions",
  props: {
    options: {
      type: Object as () => Record<SettingsKey, SettingsOption>,
      default: () => ({}) as Record<SettingsKey, SettingsOption>,
    },
  },
  setup() {
    const display = ref(null);
    const { settings } = storeToRefs(useSurveyStore());

    function updateResult(key: SettingsKey, result: boolean | number) {
      (settings.value[key] as boolean | number) = result;
    }

    return {
      display,
      settings,
      updateResult,
    };
  },
});
</script>
