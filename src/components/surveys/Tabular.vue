<template>
  <b-table striped hover :items="sortedResponses" :fields="fields"> </b-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ResponseModel from "@/store/response.model";
import { BvTableFieldArray } from "bootstrap-vue/src/components/table";

@Component({})
export default class TabularComponent extends Vue {
  @Prop({ type: Array, default: () => ["TIME"] })
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

  get fields(): BvTableFieldArray {
    const timeAndToken = [
      {
        key: "token",
        label: "Token",
        sortable: true,
        stickyColumn: true,
        variant: this.rowHeaderVariant,
      },
      {
        key: "TIME",
        label: "Time",
        sortable: true,
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
}
</script>
