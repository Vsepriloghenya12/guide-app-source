import type {
  OwnerBootstrap,
  RestaurantItem,
  WellnessItem,
  PublicGuideContent,
  HomeTip
} from '../types';
import { getOwnerToken, logoutOwner } from '../utils/ownerAuth';

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

async function request<T>(path: string, init?: RequestInit, requiresAuth = false): Promise<T> {
  const headers = new Headers(init?.headers || {});

  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = getOwnerToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  const payload = await response.json().catch(() => ({ ok: false, message: 'Некорректный ответ сервера.' }));

  if (!response.ok || payload?.ok === false) {
    if (response.status === 401) {
      logoutOwner();
    }

    throw new Error(payload?.message || 'Ошибка запроса.');
  }

  return payload as T;
}

export async function fetchPublicBootstrap(): Promise<PublicGuideContent> {
  const payload = await request<PublicGuideContent & { ok: true }>('/api/public/bootstrap', {
    method: 'GET'
  });

  return {
    restaurants: payload.restaurants,
    wellness: payload.wellness,
    featured: payload.featured,
    tips: payload.tips
  };
}

export async function loginOwnerRequest(password: string): Promise<string> {
  const payload = await request<{ ok: true; token: string }>('/api/owner/login', {
    method: 'POST',
    body: JSON.stringify({ password })
  });

  return payload.token;
}

export async function fetchOwnerBootstrap(): Promise<OwnerBootstrap> {
  const payload = await request<OwnerBootstrap & { ok: true }>('/api/owner/bootstrap', { method: 'GET' }, true);
  return {
    restaurants: payload.restaurants,
    wellness: payload.wellness,
    settings: payload.settings
  };
}

export async function uploadOwnerImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const payload = await request<{ ok: true; url: string }>(
    '/api/owner/upload',
    {
      method: 'POST',
      body: formData,
      headers: {}
    },
    true
  );

  return payload.url;
}

export async function saveRestaurant(item: RestaurantItem): Promise<void> {
  const method = item.id ? 'PUT' : 'POST';
  const path = item.id ? `/api/owner/restaurants/${item.id}` : '/api/owner/restaurants';
  await request(path, { method, body: JSON.stringify(item) }, true);
}

export async function deleteRestaurant(id: string): Promise<void> {
  await request(`/api/owner/restaurants/${id}`, { method: 'DELETE' }, true);
}

export async function saveWellness(item: WellnessItem): Promise<void> {
  const method = item.id ? 'PUT' : 'POST';
  const path = item.id ? `/api/owner/wellness/${item.id}` : '/api/owner/wellness';
  await request(path, { method, body: JSON.stringify(item) }, true);
}

export async function deleteWellness(id: string): Promise<void> {
  await request(`/api/owner/wellness/${id}`, { method: 'DELETE' }, true);
}

export async function saveHomeTips(homeTips: HomeTip[]): Promise<void> {
  await request('/api/owner/settings/home-tips', {
    method: 'PUT',
    body: JSON.stringify({ homeTips })
  }, true);
}
