<template>
  <div>
    <b-row class="login">
      <b-col> Currently connected to: {{ limeSurveyUri }} </b-col>
    </b-row>
    <b-row>
      <b-col>
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
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class SettingsView extends Vue {
  get limeSurveyUri(): string {
    return this.$store.getters.getLimeSurveyUri;
  }
  get step(): number {
    return this.$store.getters.getStep;
  }
  set step(newStep: number) {
    this.$store.commit("updateStep", newStep);
  }
}
</script>
