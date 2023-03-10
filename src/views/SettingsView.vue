<template>
  <div>
    <v-row class="login">
      <v-col> Currently connected to: {{ limeSurveyUri }} </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h2>Time slider interval in hours:</h2>
        <v-btn-toggle v-model="step" mandatory>
          <v-btn>
            <v-icon>1</v-icon>
          </v-btn>
          <v-btn>
            <v-icon>2</v-icon>
          </v-btn>
          <v-btn>
            <v-icon>6</v-icon>
          </v-btn>
          <v-btn>
            <v-icon>24</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SettingsView",
  computed: {
    limeSurveyUri(): string {
      return this.$store.getters.getLimeSurveyUri;
    },
    step: {
      get(): number {
        return this.$store.getters.getStep;
      },
      set(newStep: number) {
        this.$store.commit("updateStep", newStep);
      },
    },
  },
});
</script>
