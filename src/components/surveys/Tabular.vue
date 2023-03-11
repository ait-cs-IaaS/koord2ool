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
        <v-table
          :items="sortedResponses"
          :headers="headers"
          :sort-by="sortKey"
          :sort-desc="sortDirection === -1"
          no-data-text="There are no records to show"
          class="table-default shadow"
        >
          <template v-slot:item.token:="{ item }">
            <span :data-token="item.token">
              {{ getParticipant(item.token) }}
            </span>
            <div v-if="item.$validUntil && !hideStale" class="update-info">
              (updated {{ item.$validUntil }})
            </div>
          </template>
          <template #item.submitdate="{ item }">
            <v-icon
              v-if="item.value === 'Y'"
              icon="check-circle-fill"
              class="table-check-icon"
            ></v-icon>
            <v-icon
              v-else-if="item.value === 'N'"
              icon="x-circle-fill"
              class="table-cross-icon"
            ></v-icon>
            <v-icon
              v-else-if="item.value === ''"
              icon="dash"
              class="table-dash-icon"
            ></v-icon>
            <span v-else>{{ item.value }}</span>
          </template>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ResponseModel } from "@/store/response.model";
import { ParticipantModel } from "@/store/participant.model";
import DisplayOptions from "@/components/surveys/DisplayOptions.vue";

import { defineComponent } from "vue";

interface Header {
  text: string;
  value: string;
  align: "left" | "center" | "right";
  sortable: boolean;
}

export default defineComponent({
  name: "TabularComponent",
  components: {
    DisplayOptions,
  },
  props: {
    showKeys: {
      type: Array<string>,
      default: () => ["submitdate", "token"],
    },
    sortDirection: {
      type: Number,
      default: () => 1,
      validator: (value: unknown) => value === -1 || value === 1,
    },
    sortKey: {
      type: String,
      required: false,
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
  data() {
    return {
      hideStale: false,
      staleOptions: [
        {
          text: "Visible stale",
          value: false,
          description: "Visible stale: decorate updated rows.",
        },
        {
          text: "Hidden stale",
          value: true,
          description: "Hidden stale: show all rows as default rows.",
        },
      ],
    };
  },
  computed: {
    headers(): Header[] {
      const headers = this.responses.reduce(
        (acc: Record<string, Header>, response: ResponseModel) => {
          const keys = Object.keys(response);
          keys.forEach((key) => {
            if (!acc[key]) {
              acc[key] = {
                text: key,
                value: key,
                align: "left",
                sortable: true,
              };
            }
          });
          return acc;
        },
        {}
      );
      return Object.values(headers).filter((header: Header) =>
        this.showKeys.includes(header.value)
      );
    },
    sortedResponses() {
      return this.sortKey
        ? [...this.responses].sort((a: ResponseModel, b: ResponseModel) => {
            const left = a[this.sortKey || "submitdate"] || "";
            const right = b[this.sortKey || "submitdate"] || "";
            return left.localeCompare(right) * this.sortDirection;
          })
        : this.responses;
    },
  },
  methods: {
    getParticipant(token: string): string {
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
