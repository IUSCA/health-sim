import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import jwtDecode from "jwt-decode";
import authService from "../services/auth";
import config from "../config";

export const useAuthStore = defineStore("auth", () => {
  console.log("initializing auth store");
  const user = ref(useLocalStorage("user", {}));
  const token = ref(useLocalStorage("token", ""));
  const loggedIn = ref(false);
  const status = ref("");
  let refreshTokenTimer = null;

  function initialize() {
    console.log("auth store: initialize");
    if (user.value && token.value) {
      loggedIn.value = true;
      refreshTokenBeforeExpiry();
    }
  }

  function onLogin(data) {
    user.value = data.profile;
    token.value = data.token;
    loggedIn.value = true;
    refreshTokenBeforeExpiry();
  }

  function onLogout() {
    loggedIn.value = false;
    user.value = {};
    token.value = "";
  }

  function casLogin(ticket) {
    return authService
      .casVerify(ticket)
      .then((res) => {
        if (res.data) onLogin(res.data);
        return res.data;
      })
      .catch((error) => {
        console.error("CAS Login failed", error);
        status.value = error;
        onLogout();
        return Promise.reject();
      });
  }

  function logout() {
    onLogout();
  }

  function refreshTokenBeforeExpiry() {
    // idempotent method - will not create a timeout if one already exists
    console.log("auth store: refreshTokenBeforeExpiry");
    if (!refreshTokenTimer) {
      // timer is not running running
      try {
        const payload = jwtDecode(token.value);
        const expiresAt = new Date(payload.exp * 1000);
        const now = new Date();
        if (now < expiresAt) {
          // token is still alive
          const delay =
            expiresAt - now - config.refreshTokenTMinusSeconds * 1000;
          console.log(
            "auth store: refreshTokenBeforeExpiry: trigerring refreshToken in ",
            delay / 1000,
            "seconds"
          );
          refreshTokenTimer = setTimeout(refreshToken, delay);
        }
        // else - do nothing, navigation guard will redirect to /auth
      } catch (err) {
        console.error("Errored trying to decode access token", err);
      }
    }
  }

  function refreshToken() {
    console.log("refreshing token");
    refreshTokenTimer = null; // reset timer state
    authService
      .refreshToken()
      .then((res) => {
        if (res.data) onLogin(res.data);
      })
      .catch((err) => {
        console.error("Unable to refresh token", err);
      });
  }

  // Check for roles
  function hasRole(role) {
    return "roles" in user.value && user.value.roles.includes(role);
  }

  function saveSettings(data) {
    return authService
      .saveSettings(data)
      .then((res) => (user.value.settings = res.data.settings));
  }

  return {
    user,
    loggedIn,
    status,
    initialize,
    casLogin,
    logout,
    hasRole,
    saveSettings,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
