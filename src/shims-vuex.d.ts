import { Store } from "vuex";
import KoordStore from "@/store/koord.store";

// https://vuex.vuejs.org/guide/typescript-support.html#typing-store-property-in-vue-component
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<KoordStore>;
  }
}
