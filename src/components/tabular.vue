<template>
  <table class="overflow-x-auto lg:w-full">
    <thead>
      <tr>
        <th>Participant</th>
        <th v-for="key in showKeys" :key="key">{{ key }}</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="response in sortedResponses"
        :key="`${response.token}-${response.TIME}`"
      >
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
        <td :colspan="showKeys.length + 1" class="text-right">
          {{ responses.length }} response(s)
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ResponseModel from "@/store/response.model";

export default defineComponent({
  name: "TabularComponent",
  props: {
    showKeys: {
      type: Array,
      default: () => ["TIME"],
    },

    sortDirection: {
      type: Number,
      default: () => 1,
      validator: (value: number) => value === 1 || value === -1,
    },

    sortKey: {
      type: String,
      required: false,
    },

    responses: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    sortedResponses() {
      if (typeof this.sortKey === "string") {
        return [...(this.responses as ResponseModel[])].sort(
          (a: ResponseModel, b: ResponseModel) => {
            const left = a[this.sortKey ?? ""] ?? "";
            const right = b[this.sortKey ?? ""] ?? "";
            return left.localeCompare(right) * this.sortDirection;
          }
        );
      }
      return this.responses;
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
