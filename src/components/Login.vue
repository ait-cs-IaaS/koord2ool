<template>
  <b-form @submit.prevent="authenticate">
    <b-container fluid class="pl-0 mt-5">
      <b-row>
        <b-col cols="4">
          <b-form-group
            id="username"
            label="User"
            label-for="username-input"
            :state="acceptUser"
            invalid-feedback="Your username is too short."
          >
            <b-form-input
              id="username-input"
              v-model="username"
              :disabled="disabled"
              :state="acceptUser"
              required
            />
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="4">
          <b-form-group
            id="password"
            label="Password"
            label-for="password-input"
            :state="acceptPassword"
            invalid-feedback="Your password is too short."
          >
            <b-form-input
              id="password-input"
              v-model="password"
              type="password"
              :disabled="disabled"
              :state="acceptPassword"
              required
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mt-4">
        <b-col>
          <b-button
            type="submit"
            variant="primary"
            :disabled="disabled || !canAuthenticate"
            >Log in</b-button
          >
        </b-col>
      </b-row>
    </b-container>
  </b-form>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

/**
 * This is the login component that handles user authentication.
 */
@Component({})
export default class LoginComponent extends Vue {
  @Prop({ type: Boolean, default: () => false })
  disabled!: boolean;

  private username = "";
  private password = "";

  get acceptPassword(): boolean {
    return this.password.length > 0;
  }

  get acceptUser(): boolean {
    return this.username.length > 0;
  }

  get canAuthenticate(): boolean {
    return !this.disabled && this.username !== "" && this.password !== "";
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

  private getCredentials(
    login?: unknown,
    password?: unknown
  ): { password: string; username: string } {
    const useLogin =
      !login || typeof login !== "string" ? this.username : login;
    const usePassword =
      !password || typeof password !== "string" ? this.password : password;
    return { username: useLogin, password: usePassword };
  }

  private async authenticate(login?: string, password?: string): Promise<void> {
    this.$emit("auth-before", login);
    try {
      const credentials = this.getCredentials(login, password);
      const okay = await this.$store.dispatch("authenticate", credentials);
      if (okay) {
        this.$emit("auth-success", login);
      } else {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error("Authentication failed");
      }
    } catch (e) {
      this.$emit("auth-fail", login, e);
      this.$store.commit("setError", e);
    }
  }
}
</script>
