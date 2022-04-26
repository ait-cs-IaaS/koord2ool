<template>
  <div class="home">
    <h1>Koordon Bleu</h1>
    <img alt="Vue logo" src="../assets/logo.png" />
    <button @click="doTheThing">Do the thing!</button>
  </div>

  <div>
    <h2>Surveys</h2>
    <ul>
      <li v-for="survey in $store.state.surveys" :key="survey.sid">
        <span class="survey-id">{{ survey.sid }}</span
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
      this.$store.dispatch("authenticate", {
        username: "admin",
        password: "!.AITLimeAdmin",
      });
    },
  },
});
</script>
