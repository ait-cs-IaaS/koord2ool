<template>
  <v-app-bar app :elevation="5">
    <v-toolbar-title>
      <h2 class="text-indigo-darken-2">koord2ool</h2>
    </v-toolbar-title>

    <v-spacer />
    <v-btn v-if="!isAuthenticated" to="/login" prepend-icon="mdi-login"
      >Login</v-btn
    >
    <v-btn
      v-if="isAuthenticated"
      class="mr-2"
      to="/settings"
      theme="secondary"
      title="Settings"
      prepend-icon="mdi-cog"
      >Settings</v-btn
    >
    <v-btn
      v-if="isAuthenticated"
      class="mr-2"
      to="/logout"
      title="Logout"
      prepend-icon="mdi-logout"
      >Logout</v-btn
    >
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters, mapState } from "vuex";

type SurveyLink = {
  key: number;
  label: string;
  to: string;
};

export default defineComponent({
  name: "NavigationComponent",
  computed: {
    ...mapState(["syncing", "surveys", "username"]),
    ...mapGetters(["isAuthenticated", "getSurveys"]),

    surveyLinks(): SurveyLink[] {
      const surveyIds: number[] = [...this.getSurveys];
      return surveyIds.sort().map((surveyId: number) => {
        const title: string = this.surveys[surveyId].surveyls_title;
        return {
          key: surveyId,
          label: `${surveyId} - ${title}`,
          to: `/survey/${surveyId.toString()}`,
        };
      });
    },
  },
});
</script>
