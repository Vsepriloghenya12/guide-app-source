import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import { useGuideContent } from '../hooks/useGuideContent';
import { useUserLocation } from '../hooks/useUserLocation';
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
        const distanceKm = userLocation && hasCoordinates(listing)
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

  const withCoordinatesCount = useMemo(() => publishedPlaces.filter((place) => hasCoordinates(place)).length, [publishedPlaces]);
  const filteredCoordsCount = useMemo(
    () => publishedPlaces.filter((place) => (categoryFilter === 'all' || place.categoryId === categoryFilter) && hasCoordinates(place)).length,
    [publishedPlaces, categoryFilter]
  );

  const closestPlaces = nearbyListings.filter((place) => place.distanceKm !== null).slice(0, 3);

  return (
    <div className="page-stack">
      <PageHeader
        title="Рядом"
        subtitle="Геолокация уже работает: можно сортировать места по расстоянию, быстро фильтровать transport/ATM/routes и сразу строить маршрут."
        showBack
      />

      <section className="panel nearby-panel">
        <div className="nearby-panel__top">
          <div>
            <strong>Твоё местоположение</strong>
            <p>{geoMessage}</p>
            {updatedAtLabel ? <span className="panel-helper">Последнее обновление: {updatedAtLabel}</span> : null}
          </div>
          <div className="detail-actions detail-actions--wrap">
            <button className="button button--primary" type="button" onClick={requestLocation} disabled={geoState === 'loading'}>
              {geoState === 'loading' ? 'Определяю…' : userLocation ? 'Обновить геопозицию' : 'Разрешить геолокацию'}
            </button>
            {userLocation ? (
              <button className="button button--ghost" type="button" onClick={clearLocation}>
                Очистить
              </button>
            ) : null}
          </div>
        </div>

        <div className="nearby-panel__filters">
          <label className="field field--grow">
            <span>Раздел</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | GuideCategoryId)}>
              {nearbyCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="field field--grow">
            <span>Радиус</span>
            <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))}>
              <option value={2}>до 2 км</option>
              <option value={5}>до 5 км</option>
              <option value={10}>до 10 км</option>
              <option value={25}>до 25 км</option>
            </select>
          </label>
          <div className="nearby-panel__stat">
            <strong>{filteredCoordsCount}</strong>
            <span>точек с координатами в текущем разделе</span>
          </div>
          <div className="nearby-panel__stat">
            <strong>{withCoordinatesCount}</strong>
            <span>всего карточек уже геопривязано</span>
          </div>
        </div>

        {closestPlaces.length > 0 ? (
          <div className="nearby-mini-grid">
            {closestPlaces.map((place) => (
              <a
                key={`mini-${place.id}`}
                className="nearby-mini-card"
                href={createGoogleDirectionsUrl(toListingLike(place), userLocation)}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{place.title}</strong>
                <span>{formatDistance(place.distanceKm)}</span>
                <small>{estimateTravelTime(place.distanceKm)} на машине</small>
              </a>
            ))}
          </div>
        ) : null}
      </section>

      {loading ? <div className="panel page-loader">Загружаю места…</div> : null}
      {error ? (
        <div className="panel empty-state empty-state--left">
          <strong>Не удалось загрузить nearby</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && nearbyListings.length > 0 ? (
        <section className="nearby-grid">
          {nearbyListings.map(({ category, distanceKm, ...listing }) => (
            <article key={listing.id} className="nearby-grid__item">
              <div className="nearby-grid__meta">
                <div>
                  <strong>{formatDistance(distanceKm)}</strong>
                  <span>{category?.title || 'Раздел'}</span>
                </div>
                {distanceKm !== null ? <small>{estimateTravelTime(distanceKm, 'walk')} пешком</small> : null}
              </div>
              <ListingCard
                listing={toListingLike(listing)}
                accent={category?.accent}
                isFavorite={isFavorite(toListingLike(listing).slug)}
                onToggleFavorite={toggleFavorite}
              />
              <div className="nearby-grid__actions">
                <Link className="button button--ghost button--small" to={`/place/${listing.slug || `${listing.categoryId}-${listing.id}`}`}>
                  Подробнее
                </Link>
                <a
                  className="button button--primary button--small"
                  href={createGoogleDirectionsUrl(toListingLike(listing), userLocation)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Маршрут
                </a>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && nearbyListings.length === 0 ? (
        <div className="panel empty-state empty-state--left">
          <strong>Пока нечего показать рядом</strong>
          <p>
            Либо в карточках ещё нет координат, либо в выбранном разделе и радиусе нет мест. Уже сейчас owner может добавить lat/lng в CMS, и nearby сразу станет полезнее.
          </p>
          <div className="placeholder-state__actions">
            <Link className="button button--ghost" to="/search">
              Открыть все места
            </Link>
            <Link className="button button--primary" to="/section/transport">
              Открыть транспорт
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
