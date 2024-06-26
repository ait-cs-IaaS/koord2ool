<script setup lang="ts">
import NavComponent from "./components/Navigation.vue";
</script>

<template>
  <v-app>
    <nav-component />

    <v-main class="main">
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
.main {
  margin: 42px;
}
.v-application__wrap {
  max-height: fit-content !important;
}
</style>
