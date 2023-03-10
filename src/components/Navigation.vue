<template>
  <v-app>
    <v-app-bar app color="white" dense>
      <v-toolbar-title>
        <span class="logo">koord2ool</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn v-if="!isAuthenticated" text to="/login" v-bind="props">
            Log-in
          </v-btn>
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

      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn text v-bind="props">
            {{ username }}
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item to="/settings">
            <v-list-item-icon>
              <v-icon>mdi-settings</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-list-item to="/logout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Log out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </v-app>
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
