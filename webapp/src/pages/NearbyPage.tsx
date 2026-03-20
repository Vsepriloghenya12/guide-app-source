import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import type { Listing } from '../types';

export function NearbyPage() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    api.listings().then((response) => setListings(response.listings.slice(0, 6)));
  }, []);

  return (
    <div className="page-stack">
      <PageHeader title="Рядом" subtitle="Геопозицию пока сознательно не включал. Здесь оставил живой экран-основу под будущий геомодуль." showBack />
      <div className="panel empty-state empty-state--left">
        <strong>Следующий этап — геолокация и расстояние</strong>
        <p>
          Сейчас раздел показывает заготовку живого экрана: дальше сюда спокойно добавится расстояние, радиус и сортировка по близости без переделки архитектуры.
        </p>
      </div>
      <section className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} isFavorite={isFavorite(listing.slug)} onToggleFavorite={toggleFavorite} />
        ))}
      </section>
    </div>
  );
}
