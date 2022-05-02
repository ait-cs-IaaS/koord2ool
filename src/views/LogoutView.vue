<template>
  <b-row class="login">
    <b-col> Logging out&hellip; </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class LoginView extends Vue {
  mounted(): void {
    this.$nextTick(() => {
      this.$store.commit("setApi", undefined);
      this.$router.push("/");
    });
  }
}
</script>
