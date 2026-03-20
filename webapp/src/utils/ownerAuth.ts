export const OWNER_TOKEN_KEY = 'guide-owner-token';

export function isOwnerAuthenticated() {
  return Boolean(localStorage.getItem(OWNER_TOKEN_KEY));
}

export function getOwnerToken() {
  return localStorage.getItem(OWNER_TOKEN_KEY) || '';
}

export function loginOwner(token: string) {
  localStorage.setItem(OWNER_TOKEN_KEY, token);
}

export function logoutOwner() {
  localStorage.removeItem(OWNER_TOKEN_KEY);
}
