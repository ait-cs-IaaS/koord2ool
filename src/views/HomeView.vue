<template>
  <div class="home">
    <h1>Koordon Bleu</h1>

    <div v-if="!$store.getters.isAuthenticated">
      <p class="text-red-800">Please authenticate first.</p>

      <form>
        <div>Username: <input type="text" v-model="username" /></div>
        <div>Password: <input type="password" v-model="password" /></div>
        <div>
          <button
            type="button"
            @click="authenticate"
            :disabled="!canAuthenticate"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  </div>

  <div>
    <pie-chart-component
      :counters="[
        { name: 'A', value: 2 },
        { name: 'B', value: 3 },
      ]"
    />
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
    canAuthenticate(): boolean {
      return (
        !this.authenticating &&
        !this.$store.getters.isAuthenticated &&
        this.username !== "" &&
        this.password !== ""
      );
    },

    surveyIds(): number[] {
      return this.$store.getters.getSurveys();
    },
  },
  data() {
    const { VUE_APP_LIME_LOGIN, VUE_APP_LIME_PASSWORD } = process.env;
    return {
      authenticating: false,
      username: VUE_APP_LIME_LOGIN ?? "",
      password: VUE_APP_LIME_PASSWORD ?? "",
    };
  },
  methods: {
    authenticate() {
      this.authenticating = true;
      this.$store
        .dispatch("authenticate", {
          username: this.username,
          password: this.password,
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
        })
        .finally(() => {
          this.authenticating = false;
        });
    },
  },
});
</script>
