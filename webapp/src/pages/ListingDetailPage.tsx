import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { PageHeader } from '../components/layout/PageHeader';
import { ListingCard } from '../components/listing/ListingCard';
import { useFavorites } from '../hooks/useFavorites';
import { useGuideContent } from '../hooks/useGuideContent';
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
  const { places, categories } = useGuideContent();
  const { location: userLocation } = useUserLocation();
  const cachedListing = useMemo(
    () => places.find((item) => item.slug === slug || `${item.categorySlug || item.categoryId}-${item.id}` === slug) as Listing | undefined,
    [places, slug]
  );
  const cachedCategory = useMemo(
    () =>
      cachedListing
        ? (categories.find((item) => item.id === cachedListing.categoryId || item.slug === cachedListing.categorySlug) as Category | undefined) ?? null
        : null,
    [categories, cachedListing]
  );
  const cachedSimilar = useMemo(
    () =>
      cachedListing
        ? sortPlacesByPriority(
            places
              .filter((item) => item.categoryId === cachedListing.categoryId && item.id !== cachedListing.id)
              .map((item) => item as Listing)
          )
        : [],
    [places, cachedListing]
  );
  const [remoteListing, setRemoteListing] = useState<Listing | null>(null);
  const [remoteSimilar, setRemoteSimilar] = useState<Listing[]>([]);
  const [remoteCategory, setRemoteCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(() => !cachedListing);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const listing = remoteListing ?? cachedListing ?? null;
  const similar = remoteListing ? remoteSimilar : cachedSimilar;
  const category = remoteCategory ?? cachedCategory;

  usePageMeta({
    title: listing?.title || 'Place details',
    description: listing?.shortDescription || listing?.description || 'Detailed place card.'
  });

  useEffect(() => {
    let active = true;
    setRemoteListing(null);
    setRemoteSimilar([]);
    setRemoteCategory(null);
    setNotFound(false);
    setLoading(!cachedListing);

    api
      .listing(slug)
      .then((response) => {
        if (!active) return;
        setRemoteListing(response.listing);
        setRemoteCategory(response.category);
        setRemoteSimilar(sortPlacesByPriority(response.similar));
        setActiveImageIndex(0);
      })
      .catch(() => {
        if (active && !cachedListing) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cachedListing, slug]);

  const gallery = useMemo(
    () => (listing?.imageUrls?.length ? listing.imageUrls : listing?.coverImageUrl ? [listing.coverImageUrl] : []),
    [listing]
  );
  const activeImage = gallery[activeImageIndex] || gallery[0] || '/home-hero-background.png';

  const distanceKm = useMemo(() => {
    if (!listing || !userLocation || !hasCoordinates(listing)) {
      return null;
    }

    return haversineDistanceKm(userLocation, { lat: listing.lat!, lng: listing.lng! });
  }, [listing, userLocation]);

  if (loading) {
    return <div className="travel-state-card">Загружаю карточку места…</div>;
  }

  if (notFound || !listing || !category) {
    return (
      <div className="page-stack travel-page">
        <PageHeader title="Место не найдено" subtitle="Карточка могла быть скрыта или удалена." showBack />
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
  const summaryText = listing.shortDescription && listing.shortDescription !== listing.description ? listing.shortDescription : '';
  const summaryFacts = [
    distanceKm !== null ? `${formatDistance(distanceKm)} от вас` : '',
    listing.priceLabel || '',
    listing.hours || '',
    listing.district || ''
  ]
    .filter(Boolean)
    .slice(0, 4);

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
      <section className="travel-detail-card" data-tone={category.accent || 'coast'}>
        <div className="travel-detail-card__media">
          <Link className="travel-detail-card__back" to={detailPath} aria-label="Назад к списку">
            ‹
          </Link>
          <img src={activeImage} alt={listing.title} loading="lazy" decoding="async" />
          <span className="travel-detail-card__category">{category.shortTitle || category.title}</span>
          {listing.rating > 0 ? (
            <div className="travel-detail-card__rating">
              <strong>{listing.rating.toFixed(1)}</strong>
              <span>★★★★★</span>
            </div>
          ) : null}
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

        {summaryText || summaryFacts.length > 0 ? (
          <div className="travel-detail-card__summary">
            {summaryText ? <p className="travel-detail-card__summary-text">{summaryText}</p> : null}
            {summaryFacts.length > 0 ? (
              <div className="travel-detail-glance">
                {summaryFacts.map((item, index) => (
                  <span key={`${item}-${index}`} className="travel-detail-glance__pill">{item}</span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="travel-detail-actions">
          <a className="travel-primary-button" href={routeUrl} target="_blank" rel="noreferrer">
            Построить маршрут
          </a>
          <button className={`travel-secondary-button${favoriteActive ? ' is-active' : ''}`} type="button" onClick={() => toggleFavorite(listing.slug)}>
            {favoriteActive ? '♥ Сохранено' : '♡ Сохранить'}
          </button>
        </div>

        <div className="travel-detail-section">
          <h3>О месте</h3>
          <p>{listing.description}</p>
          <div className="travel-info-lines">
            {distanceKm !== null ? <span>{formatDistance(distanceKm)} от вас</span> : null}
            {listing.address ? <span>{listing.address}</span> : null}
            {listing.hours ? <span>{listing.hours}</span> : null}
          </div>
        </div>

        {quickTags.length > 0 ? (
          <div className="travel-detail-section">
            <h3>Особенности</h3>
            <div className="travel-tag-pills">
              {quickTags.map((item) => (
                <span key={item} className="travel-tag-pill">{item}</span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="travel-detail-section">
          <h3>Полезно знать</h3>
          <ul className="travel-detail-info-list">
            {listing.priceLabel ? (
              <li className="travel-detail-info-row">
                <strong>Цена:</strong> <span>{listing.priceLabel}</span>
              </li>
            ) : null}
            {phoneLink ? (
              <li className="travel-detail-info-row">
                <strong>Телефон:</strong>{' '}
                <a
                  className="travel-detail-info-link"
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
                  {phoneLink}
                </a>
              </li>
            ) : null}
            {websiteLink ? (
              <li className="travel-detail-info-row">
                <strong>Сайт:</strong>{' '}
                <a
                  className="travel-detail-info-link"
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
                  Открыть сайт
                </a>
              </li>
            ) : null}
            <li className="travel-detail-info-row">
              <strong>Карта:</strong>{' '}
              <a className="travel-detail-info-link" href={mapUrl} target="_blank" rel="noreferrer">
                Открыть в Google Maps
              </a>
            </li>
            <li className="travel-detail-info-row">
              <strong>Поделиться:</strong>{' '}
              <button className="travel-detail-info-link travel-detail-info-link--button" type="button" onClick={shareListing}>
                Скопировать или отправить ссылку
              </button>
            </li>
          </ul>
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="travel-section">
          <div className="travel-section__header">
            <h2>Похожие места</h2>
            <Link to={detailPath}>Открыть раздел</Link>
          </div>
          <div className="travel-listing-stack">
            {similar.slice(0, 3).map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                accent={category.accent}
                isFavorite={isFavorite(item.slug)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
