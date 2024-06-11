<template>
  <v-container fluid class="px-3 mx-0">
    <v-row class="pt-3">
      <v-col cols="12" class="avoid-page-break px-1 py-1">
        <display-options :display-options="showOptions" :options="options" />
      </v-col>
    </v-row>
    <v-row class="pt-3">
      <v-col cols="12" class="avoid-page-break px-1 py-1">
        <v-data-table
          :items="filteredRecords"
          :headers="headers"
          no-data-text="There are no records to show"
        >
          <template #item.token="{ item }">
            <span>
              {{ getParticipant(item.token) }}
            </span>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ResponseModel } from "../../types/response.model";
import { ParticipantModel } from "../../types/participant.model";
import DisplayOptions from "./DisplayOptions.vue";
import { koordStore } from "../../store";
import { defineComponent, computed } from "vue";
import { tableOptions } from "./options";
import { getParticipant } from "../../helpers/chartFunctions";

interface Header {
  title: string;
  key: string;
  align: "start" | "end";
  sortable: boolean;
}

export default defineComponent({
  name: "TabularComponent",
  components: {
    DisplayOptions,
  },
  props: {
    qKeys: {
      type: Array<string>,
      default: () => [],
    },
    responses: {
      type: Array<ResponseModel>,
      default: () => [],
    },
    participants: {
      type: Array<ParticipantModel>,
      default: () => [],
    },
    showOptions: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const store = koordStore();

    const filteredRecords = computed(() => {
      return props.responses.filter(
        (response: ResponseModel, index: number, array: ResponseModel[]) => {
          if (store.settings.onlyActive) {
            const token = response.token;
            const lastResponse = array
              .filter((item) => item.token === token)
              .reduce((prev, current) => {
                return new Date(prev.submitdate) > new Date(current.submitdate)
                  ? prev
                  : current;
              });
            return response === lastResponse;
          }
          return true;
        },
      );
    });

    const showKeys = computed(() => {
      const qk = props.qKeys;
      qk.unshift("participant");
      qk.unshift("submitdate");
      qk.unshift("token");
      return qk;
    });

    const headers = computed(() => {
      const headers = props.responses.reduce(
        (acc: Record<string, Header>, response: ResponseModel) => {
          const keys = Object.keys(response);
          keys.forEach((key) => {
            if (!acc[key]) {
              acc[key] = {
                title: key,
                key: key,
                align: "start",
                sortable: true,
              };
            }
          });
          return acc;
        },
        {},
      );
      return Object.values(headers).filter((header: Header) =>
        showKeys.value.includes(header.key),
      );
    });

    return {
      filteredRecords,
      headers,
      options: tableOptions,
      getParticipant,
    };
  },
});
</script>
