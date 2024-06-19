<template>
  <v-row class="login">
    <v-col> Currently connected to: {{ instance }} </v-col>
  </v-row>
  <v-row>
    <v-col>
      <h2>Time slider interval in hours:</h2>
      <v-btn-toggle v-model="settings.step" mandatory>
        <v-btn icon="mdi-numeric-1" :value="1" />
        <v-btn icon="mdi-numeric-6" :value="6" />
        <v-btn icon="mdi-hours-24" :value="24" />
      </v-btn-toggle>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useSurveyStore } from "../store/surveyStore";

export default defineComponent({
  name: "SettingsView",
  computed: {
    ...mapState(useSurveyStore, ["settings", "instance"]),
  },
});
</script>
