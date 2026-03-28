import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { PageHeader } from '../components/layout/PageHeader';
import { ListingCard } from '../components/listing/ListingCard';
import { useFavorites } from '../hooks/useFavorites';
import { usePageMeta } from '../hooks/usePageMeta';
import { recordGuideAnalytics } from '../utils/analytics';
import {
  createGoogleDirectionsUrl,
  createGoogleMapsUrl,
  formatDistance,
  hasCoordinates,
  haversineDistanceKm,
  sortPlacesByPriority
} from '../utils/places';
import type { Category, Listing } from '../types';
import { useUserLocation } from '../hooks/useUserLocation';

export function ListingDetailPage() {
  const { slug = '' } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { location: userLocation } = useUserLocation();
  const [listing, setListing] = useState<Listing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  usePageMeta({
    title: listing?.title || 'Place details',
    description: listing?.shortDescription || listing?.description || 'Detailed place card.'
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .listing(slug)
      .then((response) => {
        if (!active) return;
        setListing(response.listing);
        setCategory(response.category);
        setSimilar(sortPlacesByPriority(response.similar));
        setActiveImageIndex(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const gallery = useMemo(
    () => (listing?.imageUrls?.length ? listing.imageUrls : listing?.coverImageUrl ? [listing.coverImageUrl] : []),
    [listing]
  );
  const activeImage = gallery[activeImageIndex] || gallery[0] || '/danang-clean-poster.png';

  const distanceKm = useMemo(() => {
    if (!listing || !userLocation || !hasCoordinates(listing)) {
      return null;
    }

    return haversineDistanceKm(userLocation, { lat: listing.lat!, lng: listing.lng! });
  }, [listing, userLocation]);

  if (loading) {
    return <div className="travel-state-card">Loading place...</div>;
  }

  if (!listing || !category) {
    return (
      <div className="page-stack travel-page">
        <PageHeader title="Place not found" subtitle="This card may be hidden or removed." showBack />
      </div>
    );
  }

  const detailPath = category.id === 'restaurants' ? '/restaurants' : category.id === 'wellness' ? '/wellness' : category.path;
  const routeUrl = createGoogleDirectionsUrl(listing, userLocation);
  const mapUrl = createGoogleMapsUrl(listing);
  const websiteLink = listing.websiteUrl || listing.website;
  const phoneLink = listing.phoneNumber || listing.phone;
  const favoriteActive = isFavorite(listing.slug);
  const quickTags = [listing.listingType, listing.cuisine, ...(listing.services || []), ...(listing.tags || [])].filter(Boolean).slice(0, 4);

  const shareListing = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `/place/${listing.slug}`;
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({ title: listing.title, text: listing.shortDescription || listing.title, url });
        return;
      }

      if (typeof window !== 'undefined' && window.navigator?.clipboard) {
        await window.navigator.clipboard.writeText(url);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="page-stack travel-page travel-page--detail">
      <PageHeader title={listing.title} subtitle={category.shortTitle || category.title} showBack actionLabel="•••" actionPath={detailPath} />

      <section className="travel-detail-card">
        <div className="travel-detail-card__media">
          <img src={activeImage} alt={listing.title} loading="lazy" decoding="async" />
          <div className="travel-detail-card__rating">
            <strong>{listing.rating.toFixed(1)}</strong>
            <span>★★★★★</span>
          </div>
        </div>

        {gallery.length > 1 ? (
          <div className="travel-detail-thumbs">
            {gallery.map((imageUrl, index) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                className={`travel-detail-thumbs__item ${index === activeImageIndex ? 'is-active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={imageUrl} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="travel-detail-actions">
          <a className="travel-primary-button" href={routeUrl} target="_blank" rel="noreferrer">
            Directions
          </a>
          <button className={`travel-secondary-button${favoriteActive ? ' is-active' : ''}`} type="button" onClick={() => toggleFavorite(listing.slug)}>
            {favoriteActive ? '♥ Save' : '♡ Save'}
          </button>
        </div>

        <div className="travel-detail-section">
          <h3>About</h3>
          <p>{listing.description}</p>
          <div className="travel-info-lines">
            {distanceKm !== null ? <span>{formatDistance(distanceKm)} away</span> : null}
            {listing.address ? <span>{listing.address}</span> : null}
            {listing.hours ? <span>{listing.hours}</span> : null}
          </div>
        </div>

        {quickTags.length > 0 ? (
          <div className="travel-detail-section">
            <h3>Things to Do</h3>
            <div className="travel-tag-pills">
              {quickTags.map((item) => (
                <span key={item} className="travel-tag-pill">{item}</span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="travel-detail-section">
          <h3>Traveler Info</h3>
          <div className="travel-detail-info-list">
            {listing.priceLabel ? (
              <div className="travel-detail-info-item">
                <strong>Price</strong>
                <span>{listing.priceLabel}</span>
              </div>
            ) : null}
            {phoneLink ? (
              <a
                className="travel-detail-info-item"
                href={`tel:${phoneLink}`}
                onClick={() =>
                  recordGuideAnalytics({
                    kind: 'phone-click',
                    label: `${listing.title} · call`,
                    path: `tel:${phoneLink}`,
                    entityId: listing.id,
                    categoryId: listing.categoryId
                  })
                }
              >
                <strong>Phone</strong>
                <span>{phoneLink}</span>
              </a>
            ) : null}
            {websiteLink ? (
              <a
                className="travel-detail-info-item"
                href={websiteLink}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  recordGuideAnalytics({
                    kind: 'website-click',
                    label: `${listing.title} · website`,
                    path: websiteLink,
                    entityId: listing.id,
                    categoryId: listing.categoryId
                  })
                }
              >
                <strong>Website</strong>
                <span>Open website</span>
              </a>
            ) : null}
            <a className="travel-detail-info-item" href={mapUrl} target="_blank" rel="noreferrer">
              <strong>Map</strong>
              <span>Open on Google Maps</span>
            </a>
            <button className="travel-detail-info-item" type="button" onClick={shareListing}>
              <strong>Share</strong>
              <span>Send this place</span>
            </button>
          </div>
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="travel-section">
          <div className="travel-section__header">
            <h2>More Like This</h2>
            <Link to={detailPath}>Open category</Link>
          </div>
          <div className="travel-listing-stack">
            {similar.slice(0, 3).map((item) => (
              <ListingCard key={item.id} listing={item} isFavorite={isFavorite(item.slug)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
