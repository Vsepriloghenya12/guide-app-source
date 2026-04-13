import type { BootstrapPayload, Category, Collection, Listing, PublicAuthSession } from '../types';

async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: 'include',
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers
    },
    ...init
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string; error?: string })?.message || (data as { message?: string; error?: string })?.error || 'Request failed');
  }

  return data as T;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Не удалось прочитать изображение.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Ошибка чтения изображения.'));
    reader.readAsDataURL(file);
  });
}

export const api = {
  bootstrap: () => apiFetch<{ ok: true } & BootstrapPayload>('/api/bootstrap'),
  categories: () => apiFetch<{ ok: true; categories: Category[] }>('/api/categories'),
  category: (slug: string) =>
    apiFetch<{ ok: true; category: Category; filters: Array<{ config: NonNullable<Category['filterSchema']> }> }>(
      `/api/categories/${slug}`
    ),
  listings: (params?: { category?: string; search?: string; includeHidden?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.includeHidden) query.set('status', '');
    return apiFetch<{ ok: true; listings: Listing[] }>(`/api/listings?${query.toString()}`);
  },
  listing: (slug: string) =>
    apiFetch<{ ok: true; listing: Listing; category: Category; similar: Listing[] }>(`/api/listings/${slug}`),
  search: (query: string) =>
    apiFetch<{ ok: true; listings: Listing[] }>(`/api/search?q=${encodeURIComponent(query)}`),
  authSession: () => apiFetch<{ ok: true } & PublicAuthSession>('/api/auth/session'),
  authLogout: () => apiFetch<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  ownerSession: () => apiFetch<{ ok: true; authenticated: boolean }>('/api/owner/session'),
  ownerLogin: (password: string) =>
    apiFetch<{ ok: true; authenticated: boolean }>('/api/owner/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
  ownerLogout: () => apiFetch<{ ok: true }>('/api/owner/logout', { method: 'POST' }),
  ownerBootstrap: () =>
    apiFetch<{ ok: true; categories: Category[]; listings: Listing[]; collections: Collection[] }>(
      '/api/owner/bootstrap'
    ),
  saveListing: (listing: Partial<Listing> & Pick<Listing, 'categorySlug' | 'title'>) =>
    apiFetch<{ ok: true; listing: Listing }>(
      listing.id ? `/api/owner/listings/${listing.id}` : '/api/owner/listings',
      {
        method: listing.id ? 'PUT' : 'POST',
        body: JSON.stringify(listing)
      }
    ),
  deleteListing: (id: string) =>
    apiFetch<{ ok: true }>(`/api/owner/listings/${id}`, { method: 'DELETE' }),
  saveCollectionItems: (slug: string, items: unknown[]) =>
    apiFetch<{ ok: true }>(`/api/owner/collections/${slug}/items`, {
      method: 'PUT',
      body: JSON.stringify({ items })
    }),
  uploadImage: async (file: File, options?: { kind?: 'place' | 'collection' | 'category' | 'general' | 'logo' }) => {
    const dataUrl = await fileToDataUrl(file);
    return apiFetch<{ ok: true; url: string; fileName: string; mimeType: string; sizeBytes: number }>('/api/owner/upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        kind: options?.kind ?? 'general',
        dataUrl
      })
    });
  }
};
