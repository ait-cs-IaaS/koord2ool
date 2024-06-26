<template>
  <v-form fluid @submit.prevent="login(username, password)">
    <v-col>
      <v-text-field v-model="username" autocomplete="username" label="User" :disabled="disabled" :rules="[acceptUser]" required />
    </v-col>
    <v-col>
      <v-text-field
        v-model="password"
        autocomplete="current-password"
        label="Password"
        type="password"
        :disabled="disabled"
        :rules="[acceptPassword]"
        required
      />
    </v-col>
    <v-col>
      <v-btn type="submit" color="primary" :disabled="disabled || !canAuthenticate"> Log in </v-btn>
    </v-col>
  </v-form>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useMainStore } from "../store/mainStore";

export default defineComponent({
  name: "LoginComponent",
  props: {
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  emits: ["auth-before", "auth-success", "auth-fail"],
  setup(props, { emit }) {
    const username = ref("");
    const password = ref("");
    const mainStore = useMainStore();

    const acceptPassword = computed(() => password.value.length > 0);
    const acceptUser = computed(() => username.value.length > 0);
    const canAuthenticate = computed(() => !props.disabled && username.value !== "" && password.value !== "");

    onMounted(() => {
      const { VITE_APP_LIMESURVEY_LOGIN, VITE_APP_LIMESURVEY_PASSWORD } = import.meta.env;
      if (VITE_APP_LIMESURVEY_LOGIN && VITE_APP_LIMESURVEY_PASSWORD) {
        // Authenticate with LimeSurvey automatically if these environment variables are set.
        login(VITE_APP_LIMESURVEY_LOGIN, VITE_APP_LIMESURVEY_PASSWORD);
      }
    });

    const getCredentials = (login?: string, pwd?: string) => {
      return {
        username: login || username.value,
        password: pwd || password.value,
      };
    };

    const login = async (login?: string, pwd?: string) => {
      emit("auth-before", login);
      try {
        const credentials = getCredentials(login, pwd);
        const okay = await mainStore.authenticate(credentials);
        if (okay) {
          emit("auth-success", login);
        } else {
          throw new Error("Authentication failed");
        }
      } catch (e) {
        emit("auth-fail", login, e);
      }
    };

    return {
      username,
      password,
      acceptPassword,
      acceptUser,
      canAuthenticate,
      login,
    };
  },
});
</script>
