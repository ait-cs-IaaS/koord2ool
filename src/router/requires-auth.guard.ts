import { NavigationGuard } from "vue-router";
import store from "../store";

/**
 * This is a guard function that only allows navigation to a route iff the user
 * appears to be authorized.
 *
 * @param to the route to navigate to.
 * @param from the route the user is navigating away from.
 * @param next
 */
const requiresAuth: NavigationGuard = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next({ name: "login", params: { returnTo: JSON.stringify(to) } });
  } else {
    next();
  }
};

export default requiresAuth;
