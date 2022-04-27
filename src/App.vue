<template>
  <div class="container mx-auto">
    <nav-component />

    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavComponent from "@/components/nav.vue";

export default defineComponent({
  name: "App",
  components: {
    NavComponent,
  },
});
</script>
