import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createPinia, defineStore, type Pinia } from "pinia";
import { ref, computed } from "vue";
import { useSurveyStore } from "./surveyStore";

/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export const useMainStore = defineStore(
  "mainStore",
  () => {
    const error = ref<Error | undefined>(undefined);
    const limesurvey = ref<Record<string, string> | undefined>(undefined);

    const hasError = computed(() => typeof error.value !== "undefined");
    const isAuthenticated = computed(() => typeof limesurvey.value !== "undefined" && typeof limesurvey.value.username !== "undefined");
    const username = computed(() => (typeof limesurvey.value !== "undefined" ? limesurvey.value.username : "User"));
    const instance = computed(() => {
      const endpoint = import.meta.env.VITE_APP_LIMESURVEY_API;
      if (!/\/admin\/remotecontrol$/.test(endpoint)) {
        error.value = new Error(
          `LimeSurvey RPC endpoint configured to be "${endpoint}"; expecting something ending in "/admin/remotecontrol"`,
        );
        return "";
      }
      if (endpoint === undefined) {
        error.value = new Error("LimeSurvey RPC endpoint unconfigured. Please set the VITE_APP_LIMESURVEY_API environment variable.");
        return "";
      }

      try {
        if (endpoint.startsWith("http")) {
          const domain = new URL(endpoint);
          return `${domain.protocol}//${domain.hostname}`;
        } else if (endpoint.startsWith("/")) {
          return window.location.origin;
        }
      } catch {
        error.value = new Error(`Invalid URL format: ${endpoint} expecting something like "https://example.com/admin/remotecontrol`);
      }
      return "";
    });

    async function authenticate(payload: { username: string; password: string }): Promise<boolean> {
      const surveyStore = useSurveyStore();
      const session = await surveyStore.api.authenticate(payload.username, payload.password);

      console.debug("Session: ", session);

      const okay = session !== undefined;

      if (okay) {
        setApi({ session, username: payload.username });
        await surveyStore.refreshSurveys();
      } else {
        error.value = new Error("Failed to authenticate");
      }

      return okay;
    }

    function setApi(apiSession: { session: string; username: string }) {
      const surveyStore = useSurveyStore();

      surveyStore.api.username = apiSession.username;
      surveyStore.api.session = apiSession.session;
      limesurvey.value = apiSession;
    }

    function logout() {
      const surveyStore = useSurveyStore();

      limesurvey.value = undefined;
      surveyStore.api.username = undefined;
      surveyStore.api.session = undefined;
    }

    return {
      error,
      limesurvey,
      hasError,
      isAuthenticated,
      username,
      instance,
      logout,
      setApi,
      authenticate,
    };
  },
  {
    persist: {
      pick: ["limesurvey"],
    },
  },
);
