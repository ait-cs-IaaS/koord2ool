<template>
  <b-row class="home">
    <b-col v-if="!isAuthenticated">
      <div class="text-center">
        <p class="text-red-800">Please authenticate first.</p>
        <router-link to="/login">Log in</router-link>
      </div>
    </b-col>
    <b-col v-else>
      <p>
        Hi there, <span class="font-weight-bold">{{ username }}</span
        >!
      </p>
      <p>
        This is a placeholder. Is it the greatest placeholder in the world, or
        is it just a tribute?
      </p>
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

  get username(): string {
    return this.$store.getters.username;
  }
}
</script>
