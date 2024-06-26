import { NavigationGuard } from "vue-router";
import { useMainStore } from "../store/mainStore";

const requiresAuth: NavigationGuard = (to) => {
  const store = useMainStore();
  if (!store.isAuthenticated && to.name !== "login") {
    return { name: "login" };
  }
  return true;
};

export default requiresAuth;
