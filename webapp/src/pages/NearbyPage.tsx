import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import { useGuideContent } from '../hooks/useGuideContent';
import { useUserLocation } from '../hooks/useUserLocation';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  comparePlacesByPriority,
  createGoogleDirectionsUrl,
  estimateTravelTime,
  formatDistance,
  hasCoordinates,
  haversineDistanceKm,
  toListingLike
} from '../utils/places';
import type { GuideCategoryId } from '../types';

const nearbyCategoryOptions: Array<{ value: 'all' | GuideCategoryId; label: string }> = [
  { value: 'all', label: 'Все разделы' },
  { value: 'restaurants', label: 'Рестораны' },
  { value: 'wellness', label: 'СПА' },
  { value: 'routes', label: 'Маршруты' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'atm', label: 'Банкоматы' },
  { value: 'culture', label: 'Культура' },
  { value: 'photo-spots', label: 'Фото-споты' }
];

export function NearbyPage() {
  usePageMeta({
    title: 'Рядом',
    description: 'Ближайшие места, сортировка по расстоянию, радиусу и категориям с быстрыми маршрутами.'
  });
  const { isFavorite, toggleFavorite } = useFavorites();
  const { places, categories, loading, error } = useGuideContent();
  const { location: userLocation, state: geoState, message: geoMessage, requestLocation, clearLocation, updatedAtLabel } = useUserLocation();
  const [radiusKm, setRadiusKm] = useState(5);
  const [categoryFilter, setCategoryFilter] = useState<'all' | GuideCategoryId>('all');

  const publishedPlaces = useMemo(() => places.filter((place) => place.status === 'published'), [places]);

  const nearbyListings = useMemo(() => {
    return publishedPlaces
      .filter((listing) => categoryFilter === 'all' || listing.categoryId === categoryFilter)
      .map((listing) => {
        const distanceKm =
          userLocation && hasCoordinates(listing)
            ? haversineDistanceKm(userLocation, { lat: listing.lat!, lng: listing.lng! })
            : null;

        return {
          ...listing,
          distanceKm,
          category: categories.find((category) => category.id === listing.categoryId)
        };
      })
      .filter((listing) => listing.distanceKm === null || listing.distanceKm <= radiusKm)
      .sort((left, right) => {
        if (left.distanceKm === null && right.distanceKm === null) return comparePlacesByPriority(left, right);
        if (left.distanceKm === null) return 1;
        if (right.distanceKm === null) return -1;
        if (left.distanceKm !== right.distanceKm) return left.distanceKm - right.distanceKm;
        return comparePlacesByPriority(left, right);
      });
  }, [publishedPlaces, userLocation, categories, radiusKm, categoryFilter]);

  const closestPlaces = nearbyListings.filter((place) => place.distanceKm !== null).slice(0, 3);

  return (
    <div className="page-stack reference-page reference-page--nearby">
      <PageHeader title="Map View" subtitle="Places near you, sorted by distance" showBack />

      <section className="reference-nearby-hero panel">
        <div className="reference-nearby-hero__copy">
          <strong>{geoMessage}</strong>
          <span>{updatedAtLabel ? `Обновлено: ${updatedAtLabel}` : 'Разреши геопозицию, чтобы показать ближайшие места.'}</span>
        </div>

        <div className="reference-nearby-hero__controls">
          <label className="reference-select-field">
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | GuideCategoryId)}>
              {nearbyCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="reference-select-field">
            <span>Radius</span>
            <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))}>
              <option value={2}>до 2 км</option>
              <option value={5}>до 5 км</option>
              <option value={10}>до 10 км</option>
              <option value={25}>до 25 км</option>
            </select>
          </label>
        </div>

        <div className="reference-inline-actions">
          <button className="reference-link-pill" type="button" onClick={requestLocation} disabled={geoState === 'loading'}>
            {geoState === 'loading' ? 'Определяю…' : userLocation ? 'Обновить' : 'Включить гео'}
          </button>
          <Link className="reference-link-pill reference-link-pill--ghost" to="/search">
            Search
          </Link>
          {userLocation ? (
            <button className="reference-link-pill reference-link-pill--ghost" type="button" onClick={clearLocation}>
              Очистить
            </button>
          ) : null}
        </div>
      </section>

      {closestPlaces.length > 0 ? (
        <section className="reference-mini-cards">
          {closestPlaces.map((place) => (
            <a
              key={`mini-${place.id}`}
              className="reference-mini-place"
              href={createGoogleDirectionsUrl(toListingLike(place), userLocation)}
              target="_blank"
              rel="noreferrer"
            >
              <strong>{place.title}</strong>
              <span>{formatDistance(place.distanceKm)}</span>
              <small>{estimateTravelTime(place.distanceKm)} на машине</small>
            </a>
          ))}
        </section>
      ) : null}

      {loading ? <div className="panel page-loader">Загружаю места…</div> : null}
      {error ? (
        <div className="panel empty-state empty-state--left">
          <strong>Не удалось загрузить раздел</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && nearbyListings.length > 0 ? (
        <section className="listing-grid listing-grid--travel-list">
          {nearbyListings.map(({ category, ...listing }) => (
            <ListingCard
              key={listing.id}
              listing={toListingLike(listing)}
              accent={category?.accent}
              isFavorite={isFavorite(toListingLike(listing).slug)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </section>
      ) : null}

      {!loading && nearbyListings.length === 0 ? (
        <div className="panel empty-state empty-state--left">
          <strong>Пока рядом ничего не найдено</strong>
          <p>Попробуй изменить радиус, открыть все места в поиске или включить геолокацию.</p>
          <div className="reference-inline-actions">
            <Link className="reference-link-pill reference-link-pill--ghost" to="/search">
              Открыть все места
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
