<template>
  <v-container fluid class="pl-0">
    <v-row>
      <v-col cols="6">
        <h4 class="pt-5 pb-2">
          Choose a survey
          <b-btn variant="primary" @click="refresh">Refresh</b-btn>
        </h4>
        <b-list-group class="shadow">
          <b-list-group-item
            v-for="{ key, label, to } in surveyLinks"
            :key="key"
            :to="to"
          >
            {{ label }}
          </b-list-group-item>
        </b-list-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters, mapState } from "vuex";

type SurveyLink = {
  key: string | number;
  label: string;
  to: string;
};

export default defineComponent({
  name: "SurveyList",
  props: { username: { type: String, required: true } },

  computed: {
    ...mapState(["surveys"]),
    ...mapGetters(["getSurveys"]),
    surveyLinks(): SurveyLink[] {
      const surveyIds: number[] = [...this.getSurveys];
      return surveyIds.sort().map((surveyId) => {
        const title = this.surveys[surveyId].surveyls_title;
        return {
          key: surveyId,
          label: `${surveyId} - ${title}`,
          to: `/survey/${surveyId.toString()}`,
        };
      });
    },
  },
  methods: {
    async refresh(): Promise<void> {
      await this.$store.dispatch("refreshSurveys");
    },
  },
});
</script>
