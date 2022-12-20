<template>
  <b-row class="home">
    <b-col v-if="!isAuthenticated">
      <b-container fluid class="pl-0">
        <b-row>
          <b-col cols="12">
            <h1>
              Not logged in yet
              <b-icon icon="person" class="ml-4 text-primary"></b-icon>
            </h1>
            <p class="lead mt-5">Welcome to the KoordTool.</p>
            <p>You can use this tool to visualize survey responses.</p>

            <p>Please authenticate first.</p>
          </b-col>

          <b-col cols="4">
            <b-button to="/login" variant="outline-primary" class="mt-4">
              Authenticate
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-col>

    <b-col v-else>
      <b-container fluid class="pl-0">
        <b-row>
          <b-col cols="12">
            <h1>
              Logged in as {{ username }}
              <b-icon icon="person-check" class="ml-4 text-success"></b-icon>
            </h1>
            <p class="lead mt-5">Welcome to the KoordTool.</p>
            <p>You can use this tool to visualize survey responses.</p>

            <h4 class="pt-5 pb-2">Further links:</h4>
            <b-link
              v-if="instance"
              :href="'https://' + instance"
              target="_blank"
            >
              Limesurvey @ {{ instance }}
            </b-link>
          </b-col>
        </b-row>
        <survey-list :username="username" />
      </b-container>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import SurveyList from "@/components/SurveyList.vue";

@Component({
  components: {
    SurveyList,
  },
})
export default class HomeView extends Vue {
  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated;
  }

  get username(): string {
    return this.$store.getters.username;
  }

  get instance(): string {
    return this.$store.getters.getInstanceDomain;
  }
}
</script>
