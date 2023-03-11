<template>
  <v-app>
    <nav-component />

    <v-main>
      <v-alert v-if="$store.getters.hasError" type="error" closable>
        {{ $store.state.error }}
      </v-alert>
      <router-view />
    </v-main>

    <v-footer app absolute> AWAKE </v-footer>
  </v-app>
</template>

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
