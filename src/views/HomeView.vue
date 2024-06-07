<template>
  <v-container fluid>
    <v-row v-if="!isAuthenticated">
      <v-col>
        <h1>
          Not logged in yet
          <v-icon icon="person" class="ml-4 text-primary"></v-icon>
        </h1>
        <p class="lead mt-5">Welcome to the KoordTool.</p>
        <p>You can use this tool to visualize survey responses.</p>

        <p>Please authenticate first.</p>

        <v-btn to="/login" class="mt-4"> Authenticate </v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col>
        <h1>
          Logged in as {{ username }}
          <v-icon icon="person-check" class="ml-4 text-success"></v-icon>
        </h1>
        <p class="lead mt-5">Welcome to the KoordTool.</p>
        <p>You can use this tool to visualize survey responses.</p>
        <p>
          <span class="font-weight-bold">Further links:</span>
          <v-btn
            v-if="instance"
            :href="instance"
            target="_blank"
            varint="text"
            flat
          >
            Limesurvey @ {{ instance }}
          </v-btn>
        </p>
        <survey-list />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SurveyList from "../components/SurveyList.vue";
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { koordStore } from "../store";

export default defineComponent({
  name: "LoginView",
  components: {
    SurveyList,
  },
  computed: {
    ...mapState(koordStore, ["isAuthenticated", "username", "instance"]),
  },
});
</script>
