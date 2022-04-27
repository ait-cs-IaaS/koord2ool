<template>
  <nav id="top-nav">
    <router-link to="/">Home</router-link>

    <dropdown
      v-if="$store.getters.isAuthenticated"
      :dropdown-items="surveyLinks"
    />
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Dropdown from "@/components/dropdown.vue";

export default defineComponent({
  name: "NavComponent",
  components: {
    Dropdown,
  },
  computed: {
    surveyLinks() {
      return Array.from(this.$store.state.surveys.keys())
        .filter(
          (surveyId) =>
            this.$store.state.responses.get(surveyId)?.length ?? 0 !== 0
        )
        .sort()
        .map((surveyId) => ({
          key: surveyId,
          label: `${surveyId} (${
            this.$store.state.responses.get(surveyId)?.length ?? 0
          })`,
          to: { name: "survey", params: { surveyId } },
        }));
    },
  },
});
</script>
