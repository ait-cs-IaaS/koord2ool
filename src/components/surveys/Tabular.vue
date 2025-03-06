<template>
  <v-container fluid class="px-3 mx-0">
    <v-row class="pt-3">
      <v-col cols="12" class="avoid-page-break px-1 py-1">
        <display-options :options="tableOptions" />
      </v-col>
    </v-row>
    <v-row class="pt-3">
      <v-col cols="12" class="avoid-page-break px-1 py-1">
        <v-data-table :items="filteredRecords" :headers="headersFromKeys" no-data-text="There are no records to show">
          <template v-slot:[`item.token`]="{ item }">
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
import DisplayOptions from "./DisplayOptions.vue";
import { useSurveyStore } from "../../store/surveyStore";
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
  setup() {
    const store = useSurveyStore();

    const filteredRecords = computed(() => {
      return store.responsesInTimeline.filter((response: ResponseModel, index: number, array: ResponseModel[]) => {
        if (store.settings.onlyActive) {
          const token = response.token;
          const lastResponse = array
            .filter((item) => item.token === token)
            .reduce((prev, current) => {
              return new Date(prev.submitdate) > new Date(current.submitdate) ? prev : current;
            });
          return response === lastResponse;
        }
        return true;
      });
    });

    const showKeys = computed<string[]>(() => {
      const qk = [...store.questionKeysWithSubquestions];
      qk.unshift("submitdate");
      qk.unshift("token");
      return qk;
    });

    const headersFromKeys = computed<Header[]>(() => {
      return showKeys.value.map((key) => ({
        title: key,
        key: key,
        align: "start",
        sortable: true,
      }));
    });

    return {
      filteredRecords,
      headersFromKeys,
      tableOptions,
      getParticipant,
    };
  },
});
</script>
