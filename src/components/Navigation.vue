<template>
  <v-app-bar app :elevation="5">
    <v-toolbar-title>
      <h2 class="text-indigo-darken-2">koord2ool</h2>
    </v-toolbar-title>

    <v-spacer />
    <v-menu>
      <template #activator="{ props }">
        <v-btn prepend-icon="mdi-chevron-down" v-bind="props" text="Surveys" />
      </template>

      <v-list>
        <v-list-item v-for="{ key, label, to } in surveyLinks" :key="key" :to="to" :title="label" />
      </v-list>
    </v-menu>

    <v-btn v-if="!isAuthenticated" to="/login" prepend-icon="mdi-login" text="Login" />
    <v-btn v-if="isAuthenticated" class="mr-2" text="Logout" prepend-icon="mdi-logout" @click="logout" />
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { storeToRefs } from "pinia";
import { useSurveyStore } from "../store/surveyStore";
import { useMainStore } from "../store/mainStore";

export default defineComponent({
  name: "NavigationComponent",
  setup() {
    const surveyStore = useSurveyStore();
    const mainStore = useMainStore();

    const { isAuthenticated } = storeToRefs(mainStore);
    const { surveyLinks } = storeToRefs(surveyStore);

    function logout(): void {
      mainStore.logout();
    }

    return {
      surveyLinks,
      isAuthenticated,
      logout,
    };
  },
});
</script>
