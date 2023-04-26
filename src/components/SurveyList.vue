<template>
  <div class="mt-10">
    <div class="d-flex justify-space-between">
      <span class="ml-3">Choose a survey</span>
      <v-btn class="mr-3" color="green" @click="refreshSurveys">Refresh</v-btn>
    </div>
    <v-list dense fill-height fluid class="list-group">
      <v-list-item
        v-for="{ key, label, to } in surveyLinks"
        :key="key"
        :to="to"
        class="list-group-item"
      >
        {{ label }}
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { koordStore } from "../store";

type SurveyLink = {
  key: string | number;
  label: string;
  to: string;
};

export default defineComponent({
  name: "SurveyList",
  props: { username: { type: String, required: true } },

  computed: {
    ...mapState(koordStore, ["surveys", "getSurveys"]),
    surveyLinks(): SurveyLink[] {
      const surveyIds: number[] = [...this.getSurveys];
      return surveyIds.sort().map((surveyId) => {
        const title = this.surveys[surveyId].surveyls_title;
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

<style>
.v-list-subheader {
  align-items: center;
  justify-content: space-between !important;
}

.list-group-item {
  border-color: #a0a0a0;
  border-width: 1px 1px 0 1px;
}

.list-group-item:last-child {
  border-bottom-width: 0;
  border-width: 1px 1px 1px 1px;
}
</style>
