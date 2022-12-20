import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import "./plugins/bootstrap";
import "./plugins/chartjs";
import vuetify from "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "@/assets/css/app.scss";

// This is the main entry point of the application that initializes the Vue framework.
new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
