<template>
  <div>
    <nav-component class="mb-4" />

    <b-container fluid>
      <router-view />

      <footer class="d-print-none small text-muted text-right font-italic">
        AWAKE
      </footer>
    </b-container>
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
export default class App extends Vue {}
</script>
