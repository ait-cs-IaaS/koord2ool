<template>
  <v-container fluid class="px-3 mx-0">
    <v-row class="pt-3">
      <v-col cols="12" class="avoid-page-break px-1 py-1">
        <display-options
          :displayOptions="showOptions"
          :options="staleOptions"
          @result="hideStale = $event"
        />
      </v-col>
    </v-row>
    <v-row class="pt-3">
      <v-col cols="12" class="avoid-page-break px-1 py-1">
        <v-data-table
          :items="responses"
          :headers="headers"
          no-data-text="There are no records to show"
        >
          <template v-slot:item.token="{ item }">
            <span>
              {{ getParticipant(item.raw.token) }}
            </span>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ResponseModel } from "../../store/response.model";
import { ParticipantModel } from "../../store/participant.model";
import DisplayOptions from "./DisplayOptions.vue";

import { defineComponent } from "vue";

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
  mounted() {
    console.debug("TabularComponent mounted");
    console.debug(this.responses)
    console.debug(this.participants)
    console.debug(this.headers)
  },
  data() {
    return {
      hideStale: false,
      staleOptions: [
        {
          text: "Visible stale",
          icon: "mdi-land-rows-horizontal",
          value: false,
          description: "Visible stale: decorate updated rows.",
        },
        {
          text: "Hidden stale",
          icon: "mdi-eye-off",
          value: true,
          description: "Hidden stale: show all rows as default rows.",
        },
      ],
    };
  },
  computed: {
    showKeys(): string[] {
      const qk = this.qKeys;
      qk.unshift("participant");
      qk.unshift("submitdate");
      qk.unshift("token");
      return qk;
    },
    headers(): Header[] {
      const headers = this.responses.reduce(
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
        {}
      );
      return Object.values(headers).filter((header: Header) =>
        this.showKeys.includes(header.key)
      );
    }
  },
  methods: {
    getParticipant(token: string): string {
      console.debug("getParticipant", token)
      const participant = this.participants.find(
        (participant: ParticipantModel) => participant.token === token
      );
      return participant
        ? `${participant.participant_info.firstname} ${participant.participant_info.lastname}`
        : token;
    },

    filterRecords(item: ResponseModel): boolean {
      return !this.hideStale || !item.$validUntil;
    },
  },
});
</script>
