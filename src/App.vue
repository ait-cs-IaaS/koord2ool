<template>
  <div>
    <nav-component class="mb-4" />

    <b-container fluid>
      <router-view />

      <footer class="small text-muted text-right">AWAKE</footer>
    </b-container>

    <div id="loading-overlay" :class="{ 'd-none': !showLoadingOverlay }">
      <b-spinner
        class="loading-spinner"
        label="[Loading intensifies.]"
        variant="primary"
      />
    </div>
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
  get showLoadingOverlay(): boolean {
    return this.$store.state.syncing;
  }
}
</script>

<style lang="scss">
#loading-overlay {
  z-index: 1000;
  display: flex;
  font-size: 200%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: auto;
  height: auto;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.67);

  .loading-spinner {
    height: 6rem;
    width: 6rem;
  }
}
</style>
