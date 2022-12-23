<template>
  <b-container fluid class="px-3 mx-0">
    <b-row class="pt-3">
      <b-col cols="12" class="avoid-page-break px-1 py-1">
        <display-options
          :displayOptions="showOptions"
          :options="staleOptions"
          @result="hideStale = $event"
        />
      </b-col>
    </b-row>
    <b-row class="pt-3">
      <b-col cols="12" class="avoid-page-break px-1 py-1">
        <b-table
          borderless
          outlined
          hover
          responsive
          stacked="sm"
          :tbody-transition-props="{ name: 'flip-list' }"
          :items="sortedResponses"
          :fields="fields"
          :filter-function="filterRecords"
          :filter="null"
          empty-filtered-text="There are no records to show matching your filter."
          empty-text="There are no records to show."
          class="table-default shadow"
        >
          <template #cell()="data">
            <b-icon
              v-if="data.value === 'Y'"
              icon="check-circle-fill"
              class="table-check-icon"
            ></b-icon>
            <b-icon
              v-else-if="data.value === 'N'"
              icon="x-circle-fill"
              class="table-cross-icon"
            ></b-icon>
            <b-icon
              v-else-if="data.value === ''"
              icon="dash"
              class="table-dash-icon"
            ></b-icon>
            <span v-else>{{ data.value }}</span>
          </template>

          <template #cell(token)="data">
            <span :data-token="data.item.token">
              {{ data.value }}
            </span>
            <div v-if="data.item.$validUntil && !hideStale" class="update-info">
              (updated {{ data.item.$validUntil }})
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ResponseModel } from "@/store/response.model";
import { BvTableFieldArray } from "bootstrap-vue/src/components/table";
import { ParticipantModel } from "@/store/participant.model";
import DisplayOptions from "@/components/surveys/DisplayOptions.vue";

@Component({
  components: {
    DisplayOptions,
  },
})
export default class TabularComponent extends Vue {
  @Prop({ type: Array, default: () => ["submitdate", "token"] })
  showKeys!: string[];

  @Prop({
    type: Number,
    default: () => 1,
    validator: (value: unknown) => value === -1 || value === 1,
  })
  sortDirection!: -1 | 1;

  @Prop({ type: String, required: false })
  sortKey?: keyof ResponseModel;

  @Prop({ type: Array, default: () => [] })
  responses!: ResponseModel[];

  @Prop({ type: Array, default: () => [] })
  participants!: ParticipantModel[];

  @Prop({ type: Boolean, default: false })
  showOptions!: boolean;

  hideStale = false;

  readonly staleOptions = [
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
  ];

  get fields(): BvTableFieldArray {
    const staleFormatter = (value: string, key1: string, item: ResponseModel) =>
      !this.hideStale && item.$validUntil ? "text-muted" : "";
    const timeAndToken = [
      {
        key: "token",
        label: "Participant",
        formatter: (value: string) => this.getParticipant(value),
        sortable: true,
        sortByFormatted: true,
        stickyColumn: true,
        variant: "accent",
        tdClass: staleFormatter,
      },
    ];
    return [
      ...timeAndToken,
      ...this.showKeys
        .filter((key) => !timeAndToken.map((entry) => entry.key).includes(key))
        .map((key) => ({
          key,
          sortable: true,
          tdClass: staleFormatter,
        })),
    ];
  }

  /**
   * Returns the responses sorted by the current sorting sections.
   *
   * @see {@link sortKey}, {@link sortKey}
   */
  get sortedResponses(): ResponseModel[] {
    return this.sortKey
      ? [...this.responses].sort((a: ResponseModel, b: ResponseModel) => {
          const left = a[this.sortKey || "submitdate"] || "";
          const right = b[this.sortKey || "submitdate"] || "";
          return left.localeCompare(right) * this.sortDirection;
        })
      : this.responses;
  }

  /**
   * Gets the corresponding participant data for the given token.
   * If unknown (i.e., not contained in the list of participants), the token will be returned as-is.
   *
   * @param token the token for this participant
   */
  getParticipant(token: string): string {
    const participant = this.participants.find(
      (participant) => participant.token === token
    );
    return participant
      ? `${participant.participant_info.firstname} ${participant.participant_info.lastname}`
      : token;
  }

  // FIXME: the filter-function doesn't do anything.. yet? -->
  filterRecords(item: ResponseModel): boolean {
    return !this.hideStale || !item.$validUntil;
  }
}
</script>
