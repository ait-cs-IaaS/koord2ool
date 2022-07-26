import { Plugin, Store } from "vuex";
import moment from "moment";
import { LimesurveyApi } from "@/plugins";
import KoordLayout from "@/store/koord.layout";

const sessionKey = "limesurvey-session-id";
const userKey = "limesurvey-session-user";

function createCookie(
  key: string,
  value: string,
  ttl = moment.duration(15, "minutes")
) {
  const expires = moment().add(ttl).toDate().toUTCString();
  document.cookie = `${key}=${value}; expires=${expires}; path=/; SameSite=strict`;
}

function rehydrate(store: Store<KoordLayout>): void {
  let session = "";
  let user = "";
  document.cookie
    .split(";")
    .map((cookie) => cookie.split("=").map((part) => part.trim()))
    .filter(([key]) => key === sessionKey || key === userKey)
    .forEach(([key, value]) => {
      if (key === sessionKey) {
        session = value;
      } else if (key === userKey) {
        user = value;
      }
    });

  if (user && session) {
    const api = new LimesurveyApi();
    api.session = session;
    api.username = user;
    store.commit("setApi", api);
    store.dispatch("refreshSurveys");
    console.debug("Older session found; rehydrated");
  } else {
    console.debug("No session found; nothing to rehydrate");
  }
}

function dehydrate(store: Store<KoordLayout>): void {
  if (typeof store.state.limesurvey !== "undefined") {
    const { username, session } = store.state.limesurvey;

    if (typeof session === "string" && typeof username === "string") {
      createCookie(sessionKey, session);
      createCookie(userKey, username);
    } else {
      createCookie(sessionKey, "", moment.duration(0, "seconds"));
      createCookie(userKey, "", moment.duration(0, "seconds"));
    }
  }
}

const plugin: Plugin<KoordLayout> = (store) => {
  // Rehydrate:
  rehydrate(store);

  // Dehydrate:
  store.subscribe((mutation) => {
    if (mutation.type === "setApi" && typeof mutation.payload !== "undefined") {
      dehydrate(store);
    }
  });
};

export default plugin;
