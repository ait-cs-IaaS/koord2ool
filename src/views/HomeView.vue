<template>
  <div class="home">
    <h1>Koordon Bleu</h1>
    <img alt="Vue logo" src="../assets/logo.png" />
    <button @click="doTheThing">Do the thing!</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "HomeView",
  components: {},
  methods: {
    doTheThing() {
      this.$store.commit("authenticate", {
        username: "admin",
        password: "!.AITLimeAdmin",
      });
    },
  },
});
</script>
