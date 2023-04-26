<template>
  <v-form fluid @submit.prevent>
    <v-col>
      <v-text-field
        v-model="username"
        label="User"
        :disabled="disabled"
        :rules="[acceptUser]"
        required
      />
    </v-col>
    <v-col>
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        :disabled="disabled"
        :rules="[acceptPassword]"
        required
      />
    </v-col>
    <v-col>
      <v-btn
        type="submit"
        color="primary"
        :disabled="disabled || !canAuthenticate"
        @click="login(username, password)"
      >
        Log in
      </v-btn>
    </v-col>
  </v-form>
</template>

<script lang="ts">
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import { koordStore } from "../store";

export default defineComponent({
  name: "LoginComponent",
  props: {
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  emits: ["auth-before", "auth-success", "auth-fail"],
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

    canAuthenticate(): boolean {
      return !this.disabled && this.username !== "" && this.password !== "";
    },
  },

  mounted(): void {
    const { VITE_APP_LIMESURVEY_LOGIN, VITE_APP_LIMESURVEY_PASSWORD } =
      import.meta.env;
    if (VITE_APP_LIMESURVEY_LOGIN && VITE_APP_LIMESURVEY_PASSWORD) {
      this.$nextTick(() => {
        // Authenticate with LimeSurvey automatically if these environment variables are set.
        this.login(VITE_APP_LIMESURVEY_LOGIN, VITE_APP_LIMESURVEY_PASSWORD);
      });
    }
  },

  methods: {
    ...mapActions(koordStore, ["authenticate"]),
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

    async login(login?: string, password?: string): Promise<void> {
      this.$emit("auth-before", login);
      try {
        const credentials = this.getCredentials(login, password);
        const okay = await this.authenticate(credentials);
        if (okay) {
          this.$emit("auth-success", login);
        } else {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Authentication failed");
        }
      } catch (e) {
        this.$emit("auth-fail", login, e);
      }
    },
  },
});
</script>
