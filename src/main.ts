import "@babel/polyfill";
import "mutationobserver-shim";
import { createApp } from "vue";
import "./plugins/chartjs";
import vuetify from "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "@/assets/css/app.scss";

const app = createApp(App);

app.use(router);
app.use(store);
app.use(vuetify);
app.mount("#app");
