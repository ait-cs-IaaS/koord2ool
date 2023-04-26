<template>
  <v-row class="login">
    <v-col> Logging out&hellip; </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "pinia";
import { koordStore } from "../store";

export default defineComponent({
  name: "LogoutView",
  mounted(): void {
    this.$nextTick(() => {
      this.logout();
      this.$router.push("/");
    });
  },
  methods: {
    ...mapActions(koordStore, ["logout"]),
  },
});
</script>
