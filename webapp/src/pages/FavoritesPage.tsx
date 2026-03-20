import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import type { Listing } from '../types';

export function FavoritesPage() {
  const { favoriteSlugs, isFavorite, toggleFavorite } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    api.listings().then((response) => setListings(response.listings));
  }, []);

  const favoriteListings = useMemo(
    () => listings.filter((item) => favoriteSlugs.includes(item.slug)),
    [listings, favoriteSlugs]
  );

  return (
    <div className="page-stack">
      <PageHeader title="Избранное" subtitle="Сохранённые места хранятся у пользователя и доступны в нижнем меню." showBack />
      {favoriteListings.length === 0 ? (
        <div className="panel empty-state">
          <strong>Пока нет сохранённых мест</strong>
          <p>Открой карточку или список и нажми “в избранное”.</p>
        </div>
      ) : (
        <section className="listing-grid">
          {favoriteListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavorite={isFavorite(listing.slug)} onToggleFavorite={toggleFavorite} />
          ))}
        </section>
      )}
    </div>
  );
}
