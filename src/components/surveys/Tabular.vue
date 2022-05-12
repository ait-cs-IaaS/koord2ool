<template>
  <b-table striped hover :items="sortedResponses" :fields="fields"> </b-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import moment from "moment";
import ResponseModel from "@/store/response.model";
import { BvTableFieldArray } from "bootstrap-vue/src/components/table";
import { ParticipantModel } from "@/store/participant.model";

@Component({})
export default class TabularComponent extends Vue {
  @Prop({ type: Array, default: () => ["TIME", "token"] })
  showKeys!: string[];

  @Prop({
    type: Number,
    default: () => 1,
    validator: (value: unknown) => value === -1 || value === 1,
  })
  sortDirection!: -1 | 1;

  @Prop({ type: String, default: () => "dark" })
  rowHeaderVariant!: string;

  @Prop({ type: String, required: false })
  sortKey?: keyof ResponseModel;

  @Prop({ type: Array, default: () => [] })
  responses!: ResponseModel[];

  @Prop({ type: Array, default: () => [] })
  participants!: ParticipantModel[];

  get fields(): BvTableFieldArray {
    const staleFormatter = (value: string, key1: string, item: ResponseModel) =>
      item.$validUntil ? "text-muted" : "";
    const timeAndToken = [
      {
        key: "token",
        label: "Participant",
        tdClass: staleFormatter,
        formatter: (value: string) => this.getParticipant(value),
        sortable: true,
        sortByFormatted: true,
        stickyColumn: true,
        variant: this.rowHeaderVariant,
      },
      {
        key: "TIME",
        label: "When",
        tdClass: staleFormatter,
        formatter: (value: string) => moment(value).toISOString(false),
        sortable: true,
        sortByFormatted: true,
        stickyColumn: true,
        variant: this.rowHeaderVariant,
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

  get sortedResponses(): ResponseModel[] {
    return this.sortKey
      ? [...this.responses].sort((a: ResponseModel, b: ResponseModel) => {
          const left = a[this.sortKey || "TIME"] || "";
          const right = b[this.sortKey || "TIME"] || "";
          return left.localeCompare(right) * this.sortDirection;
        })
      : this.responses;
  }

  private isStale(response: ResponseModel): boolean {
    return false;
  }

  private getParticipant(token: string): string {
    const participant = this.participants.find(
      (participant) => participant.token === token
    );
    return participant
      ? `${participant.participant_info.firstname} ${participant.participant_info.lastname}`
      : token;
  }
}
</script>
