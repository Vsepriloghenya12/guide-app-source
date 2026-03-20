import type { GuideContentStore } from './guideContent';
import { notifyOwnerAuthRequired } from '../utils/ownerEvents';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type OwnerSessionResponse = {
  authenticated: boolean;
  ok?: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    let message = 'Ошибка запроса';

    try {
      const data = await response.json();
      if (typeof data?.error === 'string') {
        message = data.error;
      }
    } catch {
      // ignore json parse failure
    }

    if (response.status === 401) {
      notifyOwnerAuthRequired();
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function fetchGuideContent() {
  return request<GuideContentStore>('/api/content');
}

export function saveRestaurantsRequest(restaurants: GuideContentStore['restaurants']) {
  return request<GuideContentStore>('/api/content/restaurants', {
    method: 'PUT',
    body: JSON.stringify({ restaurants })
  });
}

export function saveWellnessRequest(wellness: GuideContentStore['wellness']) {
  return request<GuideContentStore>('/api/content/wellness', {
    method: 'PUT',
    body: JSON.stringify({ wellness })
  });
}

export function resetGuideContentRequest() {
  return request<GuideContentStore>('/api/content/reset', {
    method: 'POST'
  });
}

export function loginOwnerRequest(password: string) {
  return request<OwnerSessionResponse>('/api/owner/login', {
    method: 'POST',
    body: JSON.stringify({ password })
  });
}

export function logoutOwnerRequest() {
  return request<OwnerSessionResponse>('/api/owner/logout', {
    method: 'POST'
  });
}

export function fetchOwnerSessionRequest() {
  return request<OwnerSessionResponse>('/api/owner/session');
}
