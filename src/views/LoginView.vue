<template>
  <b-row class="login">
    <b-col>
      <div v-if="isAuthenticated">
        <survey-list :username="username" />
      </div>

      <div v-else>
        <h1>Log in</h1>
        <p>
          Please authenticate using your
          <span class="font-weight-bold"
            >LimeSurvey
            <a v-if="instance != ''" :href="instance">[{{ instance }}]</a></span
          >
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
import SurveyList from "@/components/SurveyList.vue";

@Component({
  components: {
    Login,
    SurveyList,
  },
})
export default class LoginView extends Vue {
  authenticating = false;

  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated;
  }

  get username(): string {
    return this.$store.getters.username;
  }

  get instance(): string {
    return this.$store.getters.getInstanceDomain;
  }

  @Prop({ type: String, required: false })
  returnTo?: string;

  setBusy(): void {
    this.authenticating = true;
  }

  setFailed(): void {
    this.authenticating = false;
  }

  setSuccess(): void {
    const goTo = this.returnTo || "/";
    this.$router.push(goTo);
  }
}
</script>
