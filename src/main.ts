import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import "./plugins/bootstrap";
import "./plugins/chartjs";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "@/assets/css/app.scss";

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
