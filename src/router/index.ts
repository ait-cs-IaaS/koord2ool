import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";
import requiresAuthGuard from "./requires-auth.guard";

const routes: RouteRecordRaw[] = [
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
];

if (import.meta.env.DEV) {
  routes.push({
    path: "/test",
    name: "test",
    component: () => import("../testData/TestView.vue"),
  });
}

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});
