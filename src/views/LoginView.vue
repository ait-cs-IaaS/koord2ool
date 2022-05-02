<template>
  <div class="login">
    <h1>Log in</h1>

    <div v-if="$store.getters.isAuthenticated">
      You are logged in as {{ $store.getters.username }}.
    </div>
    <div v-else>
      <form @submit.prevent="authenticate">
        <!-- login -->
        <div class="flex flex-row justify-center">
          <div class="basis-1/3 text-right">
            <label for="username">Log-in</label>
          </div>
          <div class="basis-2/3">
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="Log-in name&hellip;"
            />
          </div>
        </div>

        <!-- password -->
        <div class="flex flex-row justify-center">
          <div class="basis-1/3 text-right">
            <label for="password">Password</label>
          </div>
          <div class="basis-2/3">
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Password&hellip;"
            />
          </div>
        </div>

        <div class="flex flex-row justify-center">
          <div class="basis-auto">
            <button type="submit" class="btn" :disabled="!canAuthenticate">
              Log in
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ResponseModel, { strip } from "@/store/response.model";
export default defineComponent({
  computed: {
    canAuthenticate(): boolean {
      return (
        !this.authenticating &&
        !this.$store.getters.isAuthenticated &&
        this.username !== "" &&
        this.password !== ""
      );
    },
  },
  data() {
    return {
      authenticating: false,
      username: "",
      password: "",
    };
  },
  mounted() {
    const { VUE_APP_LIMESURVEY_LOGIN, VUE_APP_LIMESURVEY_PASSWORD } =
      process.env;
    if (VUE_APP_LIMESURVEY_LOGIN && VUE_APP_LIMESURVEY_PASSWORD) {
      this.username = VUE_APP_LIMESURVEY_LOGIN;
      this.password = VUE_APP_LIMESURVEY_PASSWORD;
      this.$nextTick(() => {
        if (this.canAuthenticate) this.authenticate();
      });
    }
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
          for (const survey of Object.values(this.$store.state.surveys)) {
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
