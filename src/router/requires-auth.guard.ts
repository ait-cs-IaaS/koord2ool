import { NavigationGuard } from "vue-router";
import store from "@/store";

const requiresAuth: NavigationGuard = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next({ name: "login" });
  } else {
    next();
  }
};

export default requiresAuth;
