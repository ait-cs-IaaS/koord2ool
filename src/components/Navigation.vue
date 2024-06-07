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
        <v-list-item
          v-for="{ key, label, to } in surveyLinks"
          :key="key"
          :to="to"
          :title="label"
        />
      </v-list>
    </v-menu>

    <v-btn
      v-if="!isAuthenticated"
      to="/login"
      prepend-icon="mdi-login"
      text="Login"
    />
    <v-btn
      v-if="isAuthenticated"
      class="mr-2"
      to="/settings"
      theme="secondary"
      text="Settings"
      prepend-icon="mdi-cog"
    />
    <v-btn
      v-if="isAuthenticated"
      class="mr-2"
      to="/logout"
      text="Logout"
      prepend-icon="mdi-logout"
    />
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { storeToRefs } from "pinia";
import { koordStore } from "../store";

export default defineComponent({
  name: "NavigationComponent",
  setup() {
    const store = koordStore();
    const { surveyLinks, isAuthenticated } = storeToRefs(store);

    return {
      surveyLinks,
      isAuthenticated,
    };
  },
});
</script>
