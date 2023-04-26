import { createVuetify } from "vuetify";
import "vuetify/lib/styles/main.sass";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VDataTable } from "vuetify/labs/VDataTable";

const vuetify = createVuetify({
  components: {
    ...components,
    VDataTable,
  },
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});

export default vuetify;
