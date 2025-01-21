<template>
  <div class="mt-10">
    <div class="d-flex justify-space-between">
      <span class="ml-3">Choose a survey</span>
      <v-btn class="mr-3" color="green" text="Refresh" @click="refresh" />
    </div>
    <v-list dense fill-height fluid class="list-group">
      <v-list-item
        v-for="{ key, label, to, compatible } in surveyLinks"
        :key="key"
        :to="to"
        class="list-group-item"
      >
        <div class="d-flex justify-space-between align-center">
          <span>{{ label }}</span>
          <v-icon
            :color="compatible ? 'green' : 'red'"
            class="rounded-circle"
            :title="compatible ? 'Survey is compatible and ready for visualization' : 'Survey is invalid. Please check if participant-based responses are enabled, timestamps are enabled, and there is at least one response.'"
          >
            {{ compatible ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </div>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { storeToRefs } from "pinia";
import { useSurveyStore } from "../store/surveyStore";

export default defineComponent({
  name: "SurveyList",
  setup() {
    const store = useSurveyStore();

    const { surveyLinks } = storeToRefs(store);

    function refresh() {
      store.refreshSurveys();
    }

    return {
      surveyLinks,
      refresh,
    };
  },
});
</script>

