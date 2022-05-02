<template>
  <div class="home">
    <h1>Koordon Bleu</h1>

    <div v-if="!isAuthenticated" class="text-center">
      <p class="text-red-800">Please authenticate first.</p>
      <router-link to="/login">Log in</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "HomeView",
  computed: {
    ...mapGetters(["isAuthenticated"]),
  },
});
</script>
