<template>
  <div>
    <nav-component class="mb-4" />

    <v-container fluid class="main-container">
      <b-alert :show="$store.getters.hasError" variant="danger" dismissible>
        {{ $store.state.error }}
      </b-alert>
      <router-view />
    </v-container>

    <footer class="footer-container text-center d-print-none py-3">
      <span>AWAKE</span>
    </footer>
  </div>
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
