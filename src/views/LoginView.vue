<template>
  <v-container fluid>
    <v-row>
      <h1>Log in</h1>
    </v-row>
    <v-row>
      <p>
        Please authenticate using your
        <span class="font-weight-bold">
          LimeSurvey
          <a v-if="instance != ''" :href="instance">[{{ instance }}]</a>
        </span>
        log-in credentials.
      </p>
    </v-row>
    <v-row>
      <v-col cols="4">
        <login
          :disabled="authenticating"
          @auth-before="setBusy"
          @auth-fail="setFailed"
          @auth-success="setSuccess"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Login from "../components/Login.vue";
import { defineComponent, onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { koordStore } from "../store";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "LoginView",
  components: {
    Login,
  },
  props: {
    returnTo: {
      type: String,
      default: "/",
    },
  },
  setup(props) {
    const authenticating = ref(false);
    const store = koordStore();

    const { isAuthenticated, instance } = storeToRefs(store);
    const router = useRouter();

    onBeforeMount(() => {
      if (isAuthenticated.value) {
        router.push("/");
      }
    });

    function setBusy(): void {
      authenticating.value = true;
    }

    function setFailed(): void {
      authenticating.value = false;
    }

    function setSuccess(): void {
      store.refreshSurveys();
      router.push(props.returnTo);
    }

    return {
      authenticating,
      isAuthenticated,
      instance,
      setBusy,
      setFailed,
      setSuccess,
    };
  },
});
</script>
