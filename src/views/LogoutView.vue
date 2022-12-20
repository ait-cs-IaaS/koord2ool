<template>
  <b-row class="login">
    <b-col> Logging out&hellip; </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class LogoutView extends Vue {
  mounted(): void {
    this.$nextTick(() => {
      this.$store.commit("setApi", {});
      this.$router.push("/");
    });
  }
}
</script>
