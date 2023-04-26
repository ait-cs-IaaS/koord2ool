import { NavigationGuard } from "vue-router";
import { koordStore } from "../store";

const requiresAuth: NavigationGuard = (to) => {
  const store = koordStore();
  if (!store.isAuthenticated && to.name !== "login") {
    return { name: "login" };
  }
  return true;
};

export default requiresAuth;
