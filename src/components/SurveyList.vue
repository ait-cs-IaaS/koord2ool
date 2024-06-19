<template>
  <div class="mt-10">
    <div class="d-flex justify-space-between">
      <span class="ml-3">Choose a survey</span>
      <v-btn class="mr-3" color="green" text="Refresh" @click="refresh" />
    </div>
    <v-list dense fill-height fluid class="list-group">
      <v-list-item v-for="{ key, label, to } in surveyLinks" :key="key" :to="to" class="list-group-item">
        {{ label }}
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

<style>
.v-list-subheader {
  align-items: center;
  justify-content: space-between !important;
}

.list-group-item {
  border-color: #a0a0a0;
  border-width: 1px 1px 0 1px;
}

.list-group-item:last-child {
  border-bottom-width: 0;
  border-width: 1px 1px 1px 1px;
}
</style>
