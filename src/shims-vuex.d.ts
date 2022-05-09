import { Store } from "vuex";
import KoordLayout from "@/store/koord.layout";

// https://vuex.vuejs.org/guide/typescript-support.html#typing-store-property-in-vue-component
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<KoordLayout>;
  }
}
