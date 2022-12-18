<template>
  <b-navbar toggleable="lg" type="light" id="top-nav" class="header-navbar">
    <b-navbar-brand to="/">
      <span class="logo">koord2ool</span>
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="!isAuthenticated" to="/login">Log-in</b-nav-item>
        <b-nav-item-dropdown
          no-caret
          v-else
          text="Surveys"
          right
          :disabled="isSyncing"
          class="mr-3"
        >
          <template #button-content>
            <b-spinner v-if="isSyncing" small variant="dark" class="mr-2" />
            <span>Surveys</span>
            <b-icon
              icon="chevron-down"
              aria-hidden="true"
              class="ml-2 small-dropdown-icon"
            ></b-icon>
          </template>
          <b-dropdown-item
            v-for="{ key, label, to } in surveyLinks"
            :key="key"
            :to="to"
            >{{ label }}</b-dropdown-item
          >
        </b-nav-item-dropdown>

        <b-nav-item-dropdown no-caret v-if="isAuthenticated" right>
          <template #button-content>
            <span>{{ username }}</span>
            <b-icon
              icon="chevron-down"
              aria-hidden="true"
              class="ml-2 small-dropdown-icon"
            ></b-icon>
          </template>
          <b-dropdown-item to="/settings">
            <b-icon icon="gear-fill" aria-hidden="true"></b-icon> Settings
          </b-dropdown-item>
          <b-dropdown-item to="/logout">
            <b-icon icon="door-open" aria-hidden="true"></b-icon> Log out
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { RawLocation } from "vue-router";

type SurveyLink = {
  key: string | number;
  label: string;
  to: RawLocation;
};

/**
 * This component provides navigation components.
 */
@Component({})
export default class NavigationComponent extends Vue {
  /**
   * Returns true iff the user is authenticated (i.e., has a session key)
   */
  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated;
  }

  /**
   * Returns true iff the application is currently syncing (according to the flag in the Vue store)
   */
  get isSyncing(): boolean {
    return this.$store.state.syncing;
  }

  /**
   * Gets the name of the logged-in user, if set; "User" otherwise.
   * This is only relevant for the UI.
   */
  get username(): string {
    return typeof this.$store.getters.username !== "undefined"
      ? this.$store.getters.username
      : "User";
  }

  /**
   * Creates link entries for the dropdown menu with all the surveys known to the application.
   */
  get surveyLinks(): SurveyLink[] {
    const surveyIds: number[] = [...this.$store.getters.getSurveys];
    return surveyIds.sort().map((surveyId) => {
      const title = this.$store.state.surveys[surveyId].surveyls_title;
      return {
        key: surveyId,
        label: `${surveyId} - ${title}`,
        to: { name: "survey", params: { surveyId: surveyId.toString() } },
      };
    });
  }
}
</script>
