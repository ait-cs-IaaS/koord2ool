<template>
  <b-row class="login">
    <b-col>
      <div v-if="isAuthenticated">
        <b-container fluid class="pl-0">
          <b-row>
            <b-col cols="12">
              <h1>
                Successfully logged in
                <b-icon icon="check-circle" class="ml-2 text-success"></b-icon>
              </h1>
              <p>
                You are logged in as <b>{{ username }}</b
                >.
              </p>
            </b-col>

            <b-col cols="4">
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
      </div>

      <div v-else>
        <h1>Log in</h1>
        <p>
          Please authenticate using your
          <span class="font-weight-bold">LimeSurvey</span>
          log-in credentials.
        </p>
        <login
          @auth-before="setBusy"
          @auth-fail="setFailed"
          @auth-success="setSuccess"
          :disabled="authenticating"
        />
      </div>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Login from "@/components/Login.vue";
import { RawLocation } from "vue-router";

type SurveyLink = {
  key: string | number;
  label: string;
  to: RawLocation;
};

@Component({
  components: {
    Login,
  },
})
export default class LoginView extends Vue {
  private authenticating = false;
  private message = "";

  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated;
  }

  get username(): string {
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

  @Prop({ type: String, required: false })
  returnTo?: string;

  private clearAlert(): void {
    this.message = "";
  }

  private setBusy(): void {
    this.authenticating = true;
    this.clearAlert();
  }

  private setFailed(): void {
    this.authenticating = false;
  }

  private setSuccess(): void {
    const goTo = this.returnTo || "/";
    this.$router.push(goTo);
  }
}
</script>
