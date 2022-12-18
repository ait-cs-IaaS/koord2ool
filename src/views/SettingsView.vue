<template>
  <b-row class="login">
    <b-col> User Settings: {{ settings }} </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { mapState } from "vuex";

@Component({
  computed: {
    ...mapState(["settings"]),
  },
})
export default class SettingsView extends Vue {
  settings!: any[];
  created() {
    console.log(this.settings);
  }
}
</script>
