<template>
  <div class="home">
    <h1>Koordon Bleu</h1>
    <img alt="Vue logo" src="../assets/logo.png" />
    <button @click="doTheThing">Do the thing!</button>
  </div>

  <div>
    <h2>Surveys</h2>
    <ul>
      <li v-for="[sid, survey] in $store.state.surveys.entries()" :key="sid">
        <span class="survey-id">{{ sid }}</span
        >:
        <span class="survey-title">{{ survey.surveyls_title }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "HomeView",
  components: {},
  methods: {
    doTheThing() {
      this.$store
        .dispatch("authenticate", {
          username: "admin",
          password: "!.AITLimeAdmin",
        })
        .then(() => {
          console.debug("Fetching details for all surveys");
          for (const survey of this.$store.state.surveys.values()) {
            console.debug(`Updating ${survey.sid}`);
            this.$store
              .dispatch("refreshSurvey", survey.sid)
              .then(() => {
                console.debug(`Survey ${survey.sid} updated`);
                this.$store.dispatch("refreshResponses", survey.sid);
              })
              .catch((e) => {
                console.warn(e);
              });
          }
        });
    },
  },
});
</script>
