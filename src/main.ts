import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import vuetify from "./plugins/vuetify";
import "@mdi/font/css/materialdesignicons.css";

const app = createApp(App);

app.use(store);
app.use(router);
app.use(vuetify);
app.mount("#app");
