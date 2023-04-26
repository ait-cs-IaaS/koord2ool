import { createWebHistory, createRouter } from "vue-router";
import requiresAuthGuard from "./requires-auth.guard";

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      props: true,
    },
    {
      path: "/logout",
      name: "logout",
      component: () => import("../views/LogoutView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
    },
    {
      path: "/survey/:surveyId",
      name: "survey",
      component: () => import("../views/SurveyView.vue"),
      beforeEnter: requiresAuthGuard,
    },
  ],
});
