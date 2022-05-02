<template>
  <b-row class="home">
    <b-col v-if="!isAuthenticated">
      <div class="text-center">
        <p class="text-red-800">Please authenticate first.</p>
        <router-link to="/login">Log in</router-link>
      </div>
    </b-col>
  </b-row>
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
