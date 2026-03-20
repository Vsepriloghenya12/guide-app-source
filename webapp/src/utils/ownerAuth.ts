import { fetchOwnerSessionRequest, loginOwnerRequest, logoutOwnerRequest } from '../data/api';
import { notifyOwnerAuthRequired } from './ownerEvents';

export async function isOwnerAuthenticated() {
  try {
    const response = await fetchOwnerSessionRequest();
    return response.authenticated;
  } catch {
    return false;
  }
}

export async function loginOwner(password: string) {
  const response = await loginOwnerRequest(password);
  return response.authenticated;
}

export async function logoutOwner() {
  try {
    await logoutOwnerRequest();
  } finally {
    notifyOwnerAuthRequired();
  }
}
