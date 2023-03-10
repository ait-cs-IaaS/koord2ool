<template>
  <v-row class="login">
    <v-col> Logging out&hellip; </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LogoutView",

  mounted(): void {
    this.$nextTick(() => {
      this.$store.commit("setApi", {});
      this.$router.push("/");
    });
  },
});
</script>
