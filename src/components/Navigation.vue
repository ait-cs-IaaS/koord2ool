<template>
  <b-navbar toggleable="lg" type="dark" variant="gradient-primary" id="top-nav">
    <b-navbar-brand to="/">Koord2ool</b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="!isAuthenticated" to="/login">Log-in</b-nav-item>
        <b-nav-item-dropdown v-else text="Surveys" right>
          <b-dropdown-item
            v-for="{ key, label, to } in surveyLinks"
            :key="key"
            :to="to"
            >{{ label }}</b-dropdown-item
          >
        </b-nav-item-dropdown>

        <b-nav-item-dropdown v-if="isAuthenticated" text="User" right>
          <b-dropdown-item to="/logout">Log out</b-dropdown-item>
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

@Component({})
export default class NavigationComponent extends Vue {
  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated;
  }

  get username(): string | undefined {
    return this.$store.getters.username;
  }

  get surveyLinks(): SurveyLink[] {
    const surveyIds: number[] = [...this.$store.getters.getSurveys];
    return surveyIds.sort().map((surveyId) => {
      const title = this.$store.state.surveys[surveyId].surveyls_title;
      return {
        key: surveyId,
        label: `${surveyId} - ${title} (${
          Array.isArray(this.$store.state.responses[surveyId]) &&
          this.$store.state.responses[surveyId].length
            ? this.$store.state.responses[surveyId].length
            : 0
        })`,
        to: { name: "survey", params: { surveyId: surveyId.toString() } },
      };
    });
  }
}
</script>
