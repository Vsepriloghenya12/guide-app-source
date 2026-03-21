import type { Banner, BootstrapPayload, Category, Collection, Listing } from '../types';

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
  ownerSession: () => apiFetch<{ ok: true; authenticated: boolean }>('/api/owner/session'),
  ownerLogin: (password: string) =>
    apiFetch<{ ok: true; authenticated: boolean }>('/api/owner/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
  ownerLogout: () => apiFetch<{ ok: true }>('/api/owner/logout', { method: 'POST' }),
  ownerBootstrap: () =>
    apiFetch<{ ok: true; categories: Category[]; listings: Listing[]; collections: Collection[]; banners: Banner[] }>(
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
  saveBanners: (items: Banner[]) =>
    apiFetch<{ ok: true }>('/api/owner/banners', {
      method: 'PUT',
      body: JSON.stringify({ items })
    }),
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiFetch<{ ok: true; url: string }>('/api/owner/upload', {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }
};
