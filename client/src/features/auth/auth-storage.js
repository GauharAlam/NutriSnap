const ACCESS_TOKEN_KEY = "fitfuel.accessToken";

export function getStoredAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function storeAccessToken(token) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}
