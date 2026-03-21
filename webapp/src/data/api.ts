import type { GuideContentStore } from './guideContent';
import { notifyOwnerAuthRequired } from '../utils/ownerEvents';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type OwnerSessionResponse = {
  authenticated: boolean;
  ok?: boolean;
};

type WrappedContentResponse = {
  ok?: boolean;
  content?: GuideContentStore;
  message?: string;
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = 'Ошибка запроса';

    if (typeof data?.error === 'string') {
      message = data.error;
    }
    if (typeof data?.message === 'string') {
      message = data.message;
    }

    if (response.status === 401) {
      notifyOwnerAuthRequired();
    }

    throw new Error(message);
  }

  return data as T;
}

export async function fetchGuideContent() {
  const response = await request<WrappedContentResponse>('/api/content');
  return response.content as GuideContentStore;
}

export async function saveRestaurantsRequest(restaurants: GuideContentStore['restaurants']) {
  const response = await request<WrappedContentResponse>('/api/content/restaurants', {
    method: 'PUT',
    body: JSON.stringify({ restaurants })
  });
  return response.content as GuideContentStore;
}

export async function saveWellnessRequest(wellness: GuideContentStore['wellness']) {
  const response = await request<WrappedContentResponse>('/api/content/wellness', {
    method: 'PUT',
    body: JSON.stringify({ wellness })
  });
  return response.content as GuideContentStore;
}

export async function saveHomeContentRequest(home: GuideContentStore['home']) {
  const response = await request<WrappedContentResponse>('/api/content/home', {
    method: 'PUT',
    body: JSON.stringify({ home })
  });
  return response.content as GuideContentStore;
}

export async function resetGuideContentRequest() {
  const response = await request<WrappedContentResponse>('/api/content/reset', {
    method: 'POST'
  });
  return response.content as GuideContentStore;
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
