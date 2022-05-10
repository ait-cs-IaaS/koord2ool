<template>
  <b-row class="login">
    <b-col>
      <h1>Log in</h1>

      <p v-if="isAuthenticated">You are logged in as {{ username }}.</p>

      <div v-else>
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
