import Vue from "vue";
import VueRouter, { RouteConfig, Route } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AboutView from "@/views/AboutView.vue";
import SurveyView from "@/views/SurveyView.vue";
import LoginView from "@/views/LoginView.vue";
import LogoutView from "@/views/LogoutView.vue";
import SettingsView from "@/views/SettingsView.vue";
import requiresAuthGuard from "@/router/requires-auth.guard";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    props: true,
  },
  {
    path: "/logout",
    name: "logout",
    component: LogoutView,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
  {
    path: "/survey/:surveyId",
    name: "survey",
    component: SurveyView,
    beforeEnter: requiresAuthGuard,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
