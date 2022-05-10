<template>
  <div class="home">
    <b-row v-if="!isAuthenticated">
      <b-col>
        <div class="text-center">
          <p class="text-red-800">Please authenticate first.</p>
          <b-btn variant="primary" to="/login">Log in</b-btn>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p class="lead">Welcome to the KoordTool.</p>
        <p>You can use this tool to visualize survey responses.</p>
        <p>More text to come&hellip; for realsies!</p>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class HomeView extends Vue {
  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated;
  }
}
</script>
