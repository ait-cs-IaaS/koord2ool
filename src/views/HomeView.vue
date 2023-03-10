<template>
  <v-row class="home">
    <v-col v-if="!isAuthenticated">
      <v-container fluid class="pl-0">
        <v-row>
          <v-col cols="12">
            <h1>
              Not logged in yet
              <v-icon icon="person" class="ml-4 text-primary"></v-icon>
            </h1>
            <p class="lead mt-5">Welcome to the KoordTool.</p>
            <p>You can use this tool to visualize survey responses.</p>

            <p>Please authenticate first.</p>
          </v-col>

          <v-col cols="4">
            <v-button to="/login" variant="outline-primary" class="mt-4">
              Authenticate
            </v-button>
          </v-col>
        </v-row>
      </v-container>
    </v-col>

    <v-col v-else>
      <v-container fluid class="pl-0">
        <v-row>
          <v-col cols="12">
            <h1>
              Logged in as {{ username }}
              <v-icon icon="person-check" class="ml-4 text-success"></v-icon>
            </h1>
            <p class="lead mt-5">Welcome to the KoordTool.</p>
            <p>You can use this tool to visualize survey responses.</p>

            <h4 class="pt-5 pb-2">Further links:</h4>
            <v-btn
              v-if="instance"
              href="https://{{ instance }}"
              target="_blank"
              text
            >
              Limesurvey @ {{ instance }}
            </v-btn>
          </v-col>
        </v-row>
        <survey-list :username="username" />
      </v-container>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import SurveyList from "@/components/SurveyList.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoginView",
  components: {
    SurveyList,
  },
  computed: {
    isAuthenticated(): boolean {
      return this.$store.getters.isAuthenticated;
    },

    username(): string {
      return this.$store.getters.username;
    },

    instance(): string {
      return this.$store.getters.getInstanceDomain;
    },
  },
});
</script>
