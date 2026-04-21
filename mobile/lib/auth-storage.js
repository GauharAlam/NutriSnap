import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY  = 'nutrisnap.accessToken';
const REFRESH_KEY = 'nutrisnap.refreshToken';

/* ─── Access Token ─── */
export async function getStoredAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function storeAccessToken(token) {
  if (!token) return clearStoredAccessToken();
  return SecureStore.setItemAsync(ACCESS_KEY, token);
}

export async function clearStoredAccessToken() {
  return SecureStore.deleteItemAsync(ACCESS_KEY);
}

/* ─── Refresh Token ─── */
export async function getStoredRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function storeRefreshToken(token) {
  if (!token) return clearStoredRefreshToken();
  return SecureStore.setItemAsync(REFRESH_KEY, token);
}

export async function clearStoredRefreshToken() {
  return SecureStore.deleteItemAsync(REFRESH_KEY);
}

/* ─── Clear All ─── */
export async function clearAllTokens() {
  await Promise.all([clearStoredAccessToken(), clearStoredRefreshToken()]);
}
