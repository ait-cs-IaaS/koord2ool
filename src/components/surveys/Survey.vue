<template>
  <v-card>
    <v-tabs v-model="tab" grow>
      <v-tab color="blue" prepend-icon="mdi-chart-areaspline" title="Charts" value="charts" />
      <v-tab color="green" prepend-icon="mdi-table" title="Tabular" value="tabular" />
    </v-tabs>
    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="charts">
          <charts />
        </v-window-item>

        <v-window-item value="tabular">
          <tabular />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Tabular from "./Tabular.vue";
import Charts from "./Charts.vue";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "SurveyComponent",
  components: {
    Tabular,
    Charts,
  },
  setup() {
    const tab = ref("charts");

    return {
      tab,
    };
  },
});
</script>

<style scoped>
.v-tab {
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
}
</style>
