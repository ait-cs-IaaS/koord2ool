<template>
  <v-container fluid>
    <v-row>
      <display-options :options="chartOptions" />
    </v-row>
    <v-row class="pt-3">
      <v-col v-if="isInvalidSurvey()">
        <v-alert outlined type="error" icon="mdi-alert" border-color="red">
          This survey is invalid. Please check if participant-based responses are enabled, timestamps are enabled and there is at least one
          response.
        </v-alert>
      </v-col>
      <v-col v-for="questionKey of questionKeys" v-else :key="questionKey" cols="12">
        <chart-card :question-key="questionKey" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ResponseModel } from "../../types/response.model";
import ChartCard from "./ChartCard.vue";
import DisplayOptions from "./DisplayOptions.vue";
import { isInvalidSurvey } from "../../helpers/chartFunctions";
import { defineComponent, onMounted } from "vue";
import { chartOptions } from "./options";
import { useSurveyStore } from "../../store/surveyStore";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "ChartsComponent",
  components: {
    DisplayOptions,
    ChartCard,
  },
  props: {
    responses: {
      type: Array<ResponseModel>,
      default: () => [],
    },
  },
  setup() {
    const store = useSurveyStore();

    const { questionKeys } = storeToRefs(store);

    onMounted(() => {
      //console.log("filteredResponses", filteredResponses.value);
    });

    return {
      chartOptions,
      questionKeys,
      isInvalidSurvey,
    };
  },
});
</script>
