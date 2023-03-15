import { Store } from "vuex";
import KoordLayout from "./store/koord.layout";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<KoordLayout>;
  }
}
