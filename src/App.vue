<template>
  <div>
    <nav-component class="mb-4" />

    <b-alert
      :show="$store.getters.hasError"
      variant="danger"
      dismissible
      @dismissed="clearError"
    >
      {{ $store.state.error }}
    </b-alert>

    <b-container fluid class="main-container">
      <router-view />
    </b-container>

    <footer class="footer-container text-center d-print-none py-3">
      <span>AWAKE</span>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavComponent from "@/components/Navigation.vue";

@Component({
  components: {
    NavComponent,
  },
})
export default class App extends Vue {
  clearError(): void {
    this.$store.commit("setError", undefined);
  }
}
</script>
