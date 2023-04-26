<template>
  <v-app-bar app :elevation="5">
    <v-toolbar-title>
      <h2 class="text-indigo-darken-2">koord2ool</h2>
    </v-toolbar-title>

    <v-spacer />
    <v-menu>
      <template #activator="{ props }">
        <v-btn prepend-icon="mdi-chevron-down" v-bind="props">Surveys</v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="{ key, label, to } in surveyLinks"
          :key="key"
          :to="to"
        >
          <v-list-item-title>{{ label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

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
import { mapState, mapActions } from "pinia";
import { koordStore } from "../store";

type SurveyLink = {
  key: number;
  label: string;
  to: string;
};

export default defineComponent({
  name: "NavigationComponent",
  computed: {
    ...mapState(koordStore, [
      "surveys",
      "username",
      "isAuthenticated",
      "getSurveys",
    ]),

    surveyLinks(): SurveyLink[] {
      console.debug("getSurveys", this.getSurveys);
      const surveyIds: number[] = [...this.getSurveys];
      console.debug("surveyIds", surveyIds);
      return surveyIds.sort().map((surveyId: number) => {
        const title: string = this.surveys[surveyId].surveyls_title;
        return {
          key: surveyId,
          label: `${surveyId} - ${title}`,
          to: `/survey/${surveyId}`,
        };
      });
    },
  },
  async mounted() {
    await this.refreshSurveys();
  },
  methods: {
    ...mapActions(koordStore, ["refreshSurveys"]),
  },
});
</script>
