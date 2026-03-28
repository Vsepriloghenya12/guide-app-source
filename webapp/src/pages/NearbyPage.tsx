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
  { value: 'all', label: 'All categories' },
  { value: 'restaurants', label: 'Food & Drink' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'routes', label: 'Routes' },
  { value: 'transport', label: 'Transport' },
  { value: 'culture', label: 'Attractions' },
  { value: 'photo-spots', label: 'Photo spots' }
];

export function NearbyPage() {
  usePageMeta({
    title: 'Map View',
    description: 'Places near you sorted by distance.'
  });
  const { isFavorite, toggleFavorite } = useFavorites();
  const { places, categories, loading, error } = useGuideContent();
  const { location: userLocation, state: geoState, message: geoMessage, requestLocation, clearLocation } = useUserLocation();
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
    <div className="page-stack travel-page travel-page--nearby">
      <PageHeader title="Map View" subtitle="Places near you" showBack />

      <section className="travel-search-panel travel-search-panel--map">
        <div className="travel-filter-row">
          <label className="travel-select">
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | GuideCategoryId)}>
              {nearbyCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="travel-select">
            <span>Radius</span>
            <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))}>
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
            </select>
          </label>
        </div>

        <div className="travel-inline-actions">
          <button className="travel-primary-button" type="button" onClick={requestLocation} disabled={geoState === 'loading'}>
            {geoState === 'loading' ? 'Locating...' : userLocation ? 'Update location' : 'Enable location'}
          </button>
          {userLocation ? (
            <button className="travel-secondary-button" type="button" onClick={clearLocation}>
              Clear
            </button>
          ) : null}
        </div>

        <p className="travel-helper-text">{geoMessage}</p>
      </section>

      <section className="travel-map-card">
        <div className="travel-map-card__canvas" />
        <div className="travel-map-card__overlay">
          <Link className="travel-primary-button" to="/search">
            Open Search
          </Link>
        </div>
      </section>

      {closestPlaces.length > 0 ? (
        <section className="travel-inline-places">
          {closestPlaces.map((place) => (
            <a
              key={`mini-${place.id}`}
              className="travel-inline-place"
              href={createGoogleDirectionsUrl(toListingLike(place), userLocation)}
              target="_blank"
              rel="noreferrer"
            >
              <strong>{place.title}</strong>
              <span>{formatDistance(place.distanceKm)}</span>
              <small>{estimateTravelTime(place.distanceKm)} drive</small>
            </a>
          ))}
        </section>
      ) : null}

      {loading ? <div className="travel-state-card">Loading places...</div> : null}
      {error ? <div className="travel-state-card">{error}</div> : null}

      {!loading && nearbyListings.length > 0 ? (
        <section className="travel-listing-stack">
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
        <div className="travel-state-card">
          <strong>No places found nearby</strong>
          <p>Try a wider radius or choose another category.</p>
        </div>
      ) : null}
    </div>
  );
}
