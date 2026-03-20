export const OWNER_SESSION_KEY = 'guide-owner-auth';

export const getOwnerPassword = () => import.meta.env.VITE_OWNER_PASSWORD || 'guide2026';

export function isOwnerAuthenticated() {
  return localStorage.getItem(OWNER_SESSION_KEY) === 'true';
}

export function loginOwner() {
  localStorage.setItem(OWNER_SESSION_KEY, 'true');
}

export function logoutOwner() {
  localStorage.removeItem(OWNER_SESSION_KEY);
}
