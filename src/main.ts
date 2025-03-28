import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import store from "./store/surveyStore";
import router from "./router";
import vuetify from "./plugins/vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "chart.js/auto";
import "chartjs-chart-financial";
import "./helpers/custom-ohlc-element";

const app = createApp(App);

app.use(store);
app.use(router);
app.use(vuetify);
app.mount("#app");
