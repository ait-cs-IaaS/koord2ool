<template>
  <div>
    <!-- FIXME: the filter-function doesn't do anything.. yet? -->
    <b-table
      borderless
      outlined
      hover
      responsive
      stacked="sm"
      :tbody-transition-props="{ name: 'flip-list' }"
      primary-key="submitdate"
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
        <div
          v-if="data.item.$validUntil && !hideStaleSetting"
          class="update-info"
        >
          (updated {{ data.item.$validUntil }})
        </div>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import moment from "moment";
import ResponseModel from "@/store/response.model";
import { BvTableFieldArray } from "bootstrap-vue/src/components/table";
import { ParticipantModel } from "@/store/participant.model";

/**
 * This is a tabular view of survey responses.
 */
@Component({})
export default class TabularComponent extends Vue {
  /**
   * The keys that should be shown in the table.
   * @default ["submitdate", "token"]
   */
  @Prop({ type: Array, default: () => ["submitdate", "token"] })
  showKeys!: string[];

  /**
   * The sorting direction, either ascending (1) or descending (-1).
   *
   * @default 1
   */
  @Prop({
    type: Number,
    default: () => 1,
    validator: (value: unknown) => value === -1 || value === 1,
  })
  sortDirection!: -1 | 1;

  /**
   * The key to sort the table by.
   */
  @Prop({ type: String, required: false })
  sortKey?: keyof ResponseModel;

  /**
   * The responses to render.
   */
  @Prop({ type: Array, default: () => [] })
  responses!: ResponseModel[];

  /**
   * A list of participants for these responses.
   */
  @Prop({ type: Array, default: () => [] })
  participants!: ParticipantModel[];

  /**
   * Iff true, "overridden" responses (i.e., a response was submit at least a second time with the same token)
   * will be hidden.
   *
   * @default false
   */
  @Prop({ type: Boolean, default: () => false })
  hideStale!: boolean;

  hideStaleSetting = false;

  @Watch("hideStale", { immediate: false })
  private changeStale(): void {
    this.hideStaleSetting = this.hideStale;
  }

  /**
   * Creates an object consumed by the bootstrap table. It contains data as well as rendering instructions.
   */
  get fields(): BvTableFieldArray {
    const staleFormatter = (value: string, key1: string, item: ResponseModel) =>
      !this.hideStaleSetting && item.$validUntil ? "text-muted" : "";
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
      {
        key: "submitdate",
        label: "When",
        formatter: (value: string) => moment(value).toISOString(false),
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
   * @private
   */
  private getParticipant(token: string): string {
    const participant = this.participants.find(
      (participant) => participant.token === token
    );
    return participant
      ? `${participant.participant_info.firstname} ${participant.participant_info.lastname}`
      : token;
  }

  private filterRecords(item: ResponseModel): boolean {
    console.debug(item);
    return !this.hideStale || !item.$validUntil;
  }
}
</script>
