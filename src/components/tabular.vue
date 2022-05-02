<template>
  <table class="overflow-x-auto lg:w-full">
    <thead>
      <tr>
        <th>Participant</th>
        <th v-for="key in questionKeys" :key="key">{{ key }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="response in responses" :key="response.token">
        <th class="response-token">{{ response.token }}</th>
        <td
          v-for="key in questionKeys"
          :key="`${response.token}-${key}`"
          class="text-center"
        >
          <span v-if="response[key]">{{ response[key] }}</span>
          <span v-else class="no-response">&ndash;</span>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td :colspan="questionKeys.length + 1" class="text-right">
          {{ responses.length }} response(s)
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ResponseModel, { ignoreKeys } from "@/store/response.model";

export default defineComponent({
  name: "TabularComponent",
  props: {
    ignore: {
      type: Array,
      default: () => [...ignoreKeys, "TIME", "token"],
    },

    responses: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    questionKeys() {
      if (typeof this.responses !== "undefined" && this.responses.length) {
        return Array.from(
          new Set<string>(
            (this.responses as ResponseModel[])
              .map((response) => Object.keys(response))
              .flat()
          )
        )
          .filter((key) => !this.ignore.includes(key))
          .sort((a, b) =>
            this.getSortingKey(a).localeCompare(this.getSortingKey(b))
          );
      }
      return [];
    },
  },
  methods: {
    getSortingKey(key: string): string {
      const matches = /^[Qq]0*([0-9]+)(.*)$/i.exec(key);
      return matches
        ? `q${matches[1].padStart(8, "0")}-${matches[2]}`
        : key.toLowerCase();
    },
  },
});
</script>

<style>
table {
  @apply border-2 border-stone-300 rounded-full;
}

thead th,
thead td,
tfoot th,
tfoot td {
  @apply bg-stone-200;
}

th.response-token {
  @apply text-left font-mono font-semibold;
}

.no-response {
  @apply text-stone-700 font-light italic text-xs;
  content: "N/A";
}
</style>
