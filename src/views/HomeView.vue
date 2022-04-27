<template>
  <div class="home">
    <h1>Koordon Bleu</h1>
    <img alt="Vue logo" src="../assets/logo.png" />
    <button @click="doTheThing">Do the thing!</button>
  </div>

  <div>
    <pie-chart-component
      :counters="[
        { name: 'A', value: 2 },
        { name: 'B', value: 3 },
      ]"
    />
  </div>

  <div>
    <h2>Surveys</h2>
    <ul>
      <li v-for="[sid, survey] in $store.state.surveys.entries()" :key="sid">
        <span class="survey-id">{{ sid }}</span
        >:
        <span class="survey-title">{{ survey.surveyls_title }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ResponseModel, { strip } from "@/store/response.model";
import PieChartComponent from "@/components/pie-chart.vue";

export default defineComponent({
  name: "HomeView",
  components: {
    PieChartComponent,
  },
  computed: {
    surveys(): number[] {
      return this.$store.getters.getSurveys();
    },
  },
  methods: {
    doTheThing() {
      this.$store
        .dispatch("authenticate", {
          username: "admin",
          password: "!.AITLimeAdmin",
        })
        .then(() => {
          console.debug("Fetching details for all surveys");
          for (const survey of this.$store.state.surveys.values()) {
            console.debug(`Updating ${survey.sid}`);
            this.$store
              .dispatch("refreshResponses", survey.sid)
              .then((responses: ResponseModel[]) => {
                if (typeof responses !== "undefined") {
                  const pruned = responses.map((response) => strip(response));
                  console.log(`Pruned responses for ${survey.sid}`, pruned);
                }
              });
          }
        });
    },
  },
});
</script>
