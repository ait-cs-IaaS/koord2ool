<template>
  <b-table striped hover :items="sortedResponses" :fields="fields" />
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

  @Prop({ type: String, required: false })
  sortKey?: keyof ResponseModel;

  @Prop({ type: Array, default: () => [] })
  responses!: ResponseModel[];

  get fields(): BvTableFieldArray {
    return this.showKeys.map((key) => ({
      key,
      sortable: true,
      stickyColumn: ["TIME", "token"].includes(key),
      tdClass: (item: ResponseModel) =>
        item.$stale === "1" ? "text-muted" : "",
    }));
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
