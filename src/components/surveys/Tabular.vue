<template>
  <b-table striped hover :items="sortedResponses" :fields="fields" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ResponseModel from "@/store/response.model";

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
  sortKey?: string;

  @Prop({ type: Array, default: () => [] })
  responses!: ResponseModel[];

  get fields(): { key: string; sortable: boolean; label?: string }[] {
    return this.showKeys.map((key) => ({
      key,
      sortable: true,
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
