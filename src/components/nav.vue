<template>
  <nav id="top-nav">
    <router-link to="/">Home</router-link>

    <router-link v-if="!isAuthenticated" to="/login">Log-in</router-link>
    <dropdown v-else :dropdown-items="surveyLinks" :show-chevron="false" />

    <aside v-if="isAuthenticated" class="logged-in">
      Hello, {{ username }}
    </aside>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Dropdown from "@/components/dropdown.vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "NavComponent",
  components: {
    Dropdown,
  },
  computed: {
    ...mapGetters(["isAuthenticated", "username"]),

    surveyLinks() {
      return Array.from(Object.keys(this.$store.state.surveys))
        .map((surveyId) => Number(surveyId))
        .filter(
          (surveyId) => this.$store.state.responses[surveyId]?.length ?? 0 !== 0
        )
        .sort()
        .map((surveyId) => ({
          key: surveyId,
          label: `${surveyId} (${
            this.$store.state.responses[surveyId]?.length ?? 0
          })`,
          to: { name: "survey", params: { surveyId } },
        }));
    },
  },
});
</script>
