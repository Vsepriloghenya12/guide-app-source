import { useCallback, useEffect, useMemo, useState } from 'react';

const FAVORITES_KEY = 'guide-app-favorites-v2';

function readFavorites() {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteSlugs));
  }, [favoriteSlugs]);

  const isFavorite = useCallback(
    (slug: string) => favoriteSlugs.includes(slug),
    [favoriteSlugs]
  );

  const toggleFavorite = useCallback((slug: string) => {
    setFavoriteSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
    );
  }, []);

  return useMemo(
    () => ({ favoriteSlugs, isFavorite, toggleFavorite }),
    [favoriteSlugs, isFavorite, toggleFavorite]
  );
}
