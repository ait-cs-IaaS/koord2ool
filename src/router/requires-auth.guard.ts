import { NavigationGuard } from "vue-router";
import { koordStore } from "../store";

/**
 * This is a guard function that only allows navigation to a route iff the user
 * appears to be authorized.
 *
 * @param to the route to navigate to.
 * @param from the route the user is navigating away from.
 */
const requiresAuth: NavigationGuard = (to, from) => {
  const store = koordStore();
  if (!store.isAuthenticated && to.name !== "login") {
    return { name: "login" };
  }
  return true;
};

export default requiresAuth;
