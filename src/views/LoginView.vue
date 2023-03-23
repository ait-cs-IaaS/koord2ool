<template>
  <v-container fluid>
    <v-row>
      <h1>Log in</h1>
    </v-row>
    <v-row>
      <p>
        Please authenticate using your
        <span class="font-weight-bold"
          >LimeSurvey
          <a v-if="instance != ''" :href="instance">[{{ instance }}]</a></span
        >
        log-in credentials.
      </p>
    </v-row>
    <v-row>
      <v-col cols="4">
      <login
        @auth-before="setBusy"
        @auth-fail="setFailed"
        @auth-success="setSuccess"
        :disabled="authenticating"
      />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Login from "../components/Login.vue";
import { defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { koordStore } from "../store";

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
    ...mapState(koordStore, ["isAuthenticated", "username", "instance"]),
  },

  methods: {
    ...mapActions(koordStore, ["refreshSurveys"]),
    setBusy(): void {
      this.authenticating = true;
    },

    setFailed(): void {
      this.authenticating = false;
    },

    setSuccess(): void {
      this.refreshSurveys();
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
