<template>
  <v-form @submit.prevent>
    <v-container fluid class="pl-0 mt-5">
      <v-row>
        <v-col cols="4">
          <v-text-field
            v-model="username"
            label="User"
            :disabled="disabled"
            :rules="[acceptUser]"
            required
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="4">
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :disabled="disabled"
            :rules="[acceptPassword]"
            required
          />
        </v-col>
      </v-row>
      <v-row class="mt-4">
        <v-col>
          <v-btn
            type="submit"
            color="primary"
            @click="authenticate(username, password)"
            :disabled="disabled || !canAuthenticate"
          >
            Log in
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoginComponent",
  props: {
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      username: "",
      password: "",
    };
  },
  computed: {
    acceptPassword(): boolean {
      return this.password.length > 0;
    },

    acceptUser(): boolean {
      return this.username.length > 0;
    },

    /**
     * Returns true iff the login action should be enabled.
     */
    canAuthenticate(): boolean {
      return !this.disabled && this.username !== "" && this.password !== "";
    },
  },

  mounted(): void {
    const { VUE_APP_LIMESURVEY_LOGIN, VUE_APP_LIMESURVEY_PASSWORD } =
      process.env;
    if (VUE_APP_LIMESURVEY_LOGIN && VUE_APP_LIMESURVEY_PASSWORD) {
      this.$nextTick(() => {
        // Authenticate with LimeSurvey automatically if these environment variables are set.
        this.authenticate(
          VUE_APP_LIMESURVEY_LOGIN,
          VUE_APP_LIMESURVEY_PASSWORD
        );
      });
    }
  },

  methods: {
    getCredentials(
      login?: unknown,
      password?: unknown
    ): { password: string; username: string } {
      const useLogin =
        !login || typeof login !== "string" ? this.username : login;
      const usePassword =
        !password || typeof password !== "string" ? this.password : password;
      return { username: useLogin, password: usePassword };
    },

    /**
     * Starts the authentication process with LimeSurvey.
     *
     * @param login the login to use
     * @param password the password to use
     */
    async authenticate(login?: string, password?: string): Promise<void> {
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
    },
  },
});
</script>
