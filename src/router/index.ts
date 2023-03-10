import { RouteRecordRaw, createWebHistory, createRouter } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import SurveyView from "@/views/SurveyView.vue";
import LoginView from "@/views/LoginView.vue";
import LogoutView from "@/views/LogoutView.vue";
import SettingsView from "@/views/SettingsView.vue";
import requiresAuthGuard from "@/router/requires-auth.guard";

const routes: RouteRecordRaw[] = [
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
    path: "/survey/:surveyId",
    name: "survey",
    component: SurveyView,
    beforeEnter: requiresAuthGuard,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
