<template>
  <b-container fluid class="pl-0">
    <b-row>
      <b-col cols="6">
        <h4 class="pt-5 pb-2">Choose a survey</h4>
        <b-list-group class="shadow">
          <b-list-group-item
            v-for="{ key, label, to } in surveyLinks"
            :key="key"
            :to="to"
          >
            {{ label }}
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { RawLocation } from "vue-router";

type SurveyLink = {
  key: string | number;
  label: string;
  to: RawLocation;
};
@Component({})
export default class SurveyListComponent extends Vue {
  @Prop({ type: String, required: true })
  username!: string;

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
