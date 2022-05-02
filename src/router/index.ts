import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AboutView from "@/views/AboutView.vue";
import SurveyView from "@/views/SurveyView.vue";
import LoginView from "@/views/LoginView.vue";
import requiresAuthGuard from "@/router/requires-auth.guard";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
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

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
