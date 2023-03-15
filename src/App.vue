<script setup lang="ts">
import NavComponent from "./components/Navigation.vue";
</script>

<template>
  <v-app>
    <nav-component />

    <v-main style="margin: 42px;">
      <router-view />
    </v-main>

    <v-footer app> AWAKE </v-footer>
  </v-app>
</template>

<style scoped>
:deep(.v-application__wrap) {
  max-height: fit-content !important;
}
</style>
