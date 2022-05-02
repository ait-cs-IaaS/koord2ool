<template>
  <b-row class="login">
    <b-col>
      <h1>Log in</h1>

      <div v-if="$store.getters.isAuthenticated">
        You are logged in as {{ $store.getters.username }}.
      </div>
      <b-form v-else @submit.prevent="authenticate">
        <b-form-group id="username" label="Log-in" label-for="username-input">
          <b-form-input id="username-input" v-model="username" required />
        </b-form-group>

        <b-form-group id="password" label="Password" label-for="password-input">
          <b-form-input
            id="password-input"
            v-model="password"
            type="password"
            required
          />
        </b-form-group>

        <b-button type="submit" variant="primary" :disabled="!canAuthenticate"
          >Log in</b-button
        >
      </b-form>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class LoginView extends Vue {
  private authenticating = false;
  private username = "";
  private password = "";

  get canAuthenticate(): boolean {
    return !this.authenticating && this.username !== "" && this.password !== "";
  }

  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated;
  }

  mounted(): void {
    const { VUE_APP_LIMESURVEY_LOGIN, VUE_APP_LIMESURVEY_PASSWORD } =
      process.env;
    if (VUE_APP_LIMESURVEY_LOGIN && VUE_APP_LIMESURVEY_PASSWORD) {
      this.$nextTick(() => {
        this.authenticate(
          VUE_APP_LIMESURVEY_LOGIN,
          VUE_APP_LIMESURVEY_PASSWORD
        );
      });
    }
  }

  private async authenticate(login?: string, password?: string): Promise<void> {
    this.authenticating = true;
    try {
      const okay = await this.$store.dispatch("authenticate", {
        username: login || this.username,
        password: password || this.password,
      });
      if (okay) {
        this.$nextTick(() => {
          this.$router.push("/");
        });
      }
    } finally {
      this.authenticating = false;
    }
  }
}
</script>
