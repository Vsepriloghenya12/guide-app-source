import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import { useGuideContent } from '../hooks/useGuideContent';
import { comparePlacesByPriority, formatDistance, hasCoordinates, haversineDistanceKm, toListingLike } from '../utils/places';

type UserLocation = {
  lat: number;
  lng: number;
};

export function NearbyPage() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { places, categories, loading, error } = useGuideContent();
  const [radiusKm, setRadiusKm] = useState(5);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [geoMessage, setGeoMessage] = useState('Разреши геолокацию, чтобы увидеть реальные расстояния до мест.');

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoState('error');
      setGeoMessage('Этот браузер не поддерживает геолокацию.');
      return;
    }

    setGeoState('loading');
    setGeoMessage('Определяю текущее местоположение…');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoState('ready');
        setGeoMessage('Геопозиция получена. Список отсортирован по расстоянию.');
      },
      (error) => {
        setGeoState('error');
        setGeoMessage(error.message || 'Не удалось определить геопозицию.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 120000
      }
    );
  };

  const publishedPlaces = useMemo(() => places.filter((place) => place.status === 'published'), [places]);

  const nearbyListings = useMemo(() => {
    return publishedPlaces
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
  }, [publishedPlaces, userLocation, categories, radiusKm]);

  const withCoordinatesCount = useMemo(() => publishedPlaces.filter((place) => hasCoordinates(place)).length, [publishedPlaces]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Рядом"
        subtitle="Раздел уже умеет запрашивать геопозицию и сортировать места по расстоянию, если координаты заполнены в CMS."
        showBack
      />

      <section className="panel nearby-panel">
        <div className="nearby-panel__top">
          <div>
            <strong>Твоё местоположение</strong>
            <p>{geoMessage}</p>
          </div>
          <button className="button button--primary" type="button" onClick={requestLocation} disabled={geoState === 'loading'}>
            {geoState === 'loading' ? 'Определяю…' : userLocation ? 'Обновить геопозицию' : 'Разрешить геолокацию'}
          </button>
        </div>

        <div className="nearby-panel__filters">
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
            <strong>{withCoordinatesCount}</strong>
            <span>карточек уже с координатами</span>
          </div>
        </div>
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
                <strong>{formatDistance(distanceKm)}</strong>
                <span>{category?.title || 'Раздел'}</span>
              </div>
              <ListingCard
                listing={toListingLike(listing)}
                accent={category?.accent}
                isFavorite={isFavorite(toListingLike(listing).slug)}
                onToggleFavorite={toggleFavorite}
              />
            </article>
          ))}
        </section>
      ) : null}

      {!loading && nearbyListings.length === 0 ? (
        <div className="panel empty-state empty-state--left">
          <strong>Пока нечего показать рядом</strong>
          <p>
            Либо в карточках ещё нет координат, либо в выбранном радиусе нет мест. Дальше owner сможет наполнять lat/lng прямо через CMS.
          </p>
          <div className="placeholder-state__actions">
            <Link className="button button--ghost" to="/search">
              Открыть все места
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
