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
    <b-row>
      <b-col cols="12" md="4" lg="2">
        <div class="font-weight-bold">Further links:</div>
      </b-col>
      <b-col cols="12" md="8" lg="10">
        <b-link v-if="limesurveyUrl" :href="limesurveyUrl" target="_blank">
          Limesurvey @ {{ limesurveyUrl }}
        </b-link>
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

  get limesurveyUrl(): string {
    const endpoint = process.env.VUE_APP_LIMESURVEY_API;
    const cutoff = endpoint.lastIndexOf("/admin/remotecontrol");
    return cutoff !== -1 ? endpoint.substring(0, cutoff) : "";
  }
}
</script>
