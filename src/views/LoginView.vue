<template>
  <v-row class="login">
    <v-col>
      <div>
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
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Login from "@/components/Login.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoginView",

  components: {
    Login,
  },

  props: {
    returnTo: {
      type: String,
    },
  },

  data() {
    return {
      authenticating: false,
    };
  },

  computed: {
    isAuthenticated(): boolean {
      return this.$store.getters.isAuthenticated;
    },

    username(): string {
      return this.$store.getters.username;
    },

    instance(): string {
      return this.$store.getters.getInstanceDomain;
    },
  },

  methods: {
    setBusy(): void {
      this.authenticating = true;
    },

    setFailed(): void {
      this.authenticating = false;
    },

    setSuccess(): void {
      const goTo = this.returnTo || "/";
      this.$router.push(goTo);
    },
  },

  mounted(): void {
    this.$nextTick(() => {
      if (this.isAuthenticated) {
        this.$router.push("/");
      }
    });
  },
});
</script>
