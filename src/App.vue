<template>
  <v-app class="main">
    <nav-component />

    <v-main>
      <router-view />
    </v-main>

    <v-footer app> AWAKE </v-footer>
  </v-app>
</template>

<style scoped lang="scss">
:deep(.v-application__wrap) {
  min-height: 97vh !important;
  max-width: fit-content !important;
}
</style>

<script lang="ts">
import NavComponent from "@/components/Navigation.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {
    NavComponent,
  },
});
</script>
