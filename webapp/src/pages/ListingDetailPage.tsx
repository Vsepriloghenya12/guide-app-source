import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import { recordGuideAnalytics } from '../utils/analytics';
import { create2GisUrl, createAppleMapsUrl, createGoogleMapsUrl } from '../utils/places';
import type { Category, Listing } from '../types';

export function ListingDetailPage() {
  const { slug = '' } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [listing, setListing] = useState<Listing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .listing(slug)
      .then((response) => {
        if (!active) return;
        setListing(response.listing);
        setCategory(response.category);
        setSimilar(response.similar);
        setActiveImageIndex(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const gallery = useMemo(() => listing?.imageUrls?.length ? listing.imageUrls : listing?.coverImageUrl ? [listing.coverImageUrl] : [], [listing]);
  const activeImage = gallery[activeImageIndex] || gallery[0] || '/danang-clean-poster.png';

  const mapUrl = useMemo(() => (listing ? createGoogleMapsUrl(listing) : '#'), [listing]);
  const appleMapsUrl = useMemo(() => (listing ? createAppleMapsUrl(listing) : '#'), [listing]);
  const gisUrl = useMemo(() => (listing ? create2GisUrl(listing) : '#'), [listing]);
  const embedUrl = useMemo(() => {
    if (!listing) return '';
    return `https://www.google.com/maps?q=${encodeURIComponent(listing.mapQuery || listing.address || listing.title)}&output=embed`;
  }, [listing]);

  if (loading) {
    return <div className="panel page-loader">Загружаю карточку места…</div>;
  }

  if (!listing || !category) {
    return (
      <div className="page-stack">
        <PageHeader title="Место не найдено" subtitle="Похоже, карточка скрыта или была удалена." showBack />
      </div>
    );
  }

  const favoriteActive = isFavorite(listing.slug);

  const toggleFavoriteState = () => {
    toggleFavorite(listing.slug);
  };

  return (
    <div className="page-stack detail-page">
      <PageHeader
        title={listing.title}
        subtitle={listing.shortDescription}
        showBack
        actionLabel={category.shortTitle}
        actionPath={category.id === 'restaurants' ? '/restaurants' : category.id === 'wellness' ? '/wellness' : `/section/${category.slug}`}
      />

      <section className="detail-hero panel">
        <div className="detail-hero__media">
          <div className="detail-hero__image-wrap">
            <img className="detail-hero__image" src={activeImage} alt={listing.title} loading="lazy" />
            <div className="detail-hero__overlay">
              <span className="rating-pill">★ {listing.rating.toFixed(1)}</span>
              {listing.featured ? <span className="chip">Топ</span> : null}
              {listing.priceLabel ? <span className="chip">{listing.priceLabel}</span> : null}
            </div>
          </div>

          {gallery.length > 1 ? (
            <div className="detail-gallery-strip">
              {gallery.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  className={`detail-gallery-strip__thumb ${index === activeImageIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={imageUrl} alt={`${listing.title} ${index + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="detail-hero__content">
          <div className="detail-meta-row">
            <span className="chip">{category.title}</span>
            {listing.listingType ? <span className="chip chip--soft">{listing.listingType}</span> : null}
            {listing.cuisine ? <span className="chip chip--soft">{listing.cuisine}</span> : null}
          </div>

          <p>{listing.description}</p>

          <div className="detail-actions detail-actions--wrap">
            {listing.phone ? (
              <a
                className="button"
                href={`tel:${listing.phone}`}
                onClick={() =>
                  recordGuideAnalytics({
                    kind: 'phone-click',
                    label: `${listing.title} · звонок`,
                    path: `tel:${listing.phone}`,
                    entityId: listing.id,
                    categoryId: listing.categoryId
                  })
                }
              >
                Позвонить
              </a>
            ) : null}
            {listing.website ? (
              <a
                className="button button--ghost"
                href={listing.website}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  recordGuideAnalytics({
                    kind: 'website-click',
                    label: `${listing.title} · сайт`,
                    path: listing.website,
                    entityId: listing.id,
                    categoryId: listing.categoryId
                  })
                }
              >
                Сайт
              </a>
            ) : null}
            <button className={`button button--ghost${favoriteActive ? ' is-active' : ''}`} type="button" onClick={toggleFavoriteState}>
              {favoriteActive ? 'Убрать из избранного' : 'В избранное'}
            </button>
          </div>

          <div className="detail-actions detail-actions--wrap detail-actions--maps">
            <a className="button button--ghost" href={mapUrl} target="_blank" rel="noreferrer">Google Maps</a>
            <a className="button button--ghost" href={appleMapsUrl} target="_blank" rel="noreferrer">Apple Maps</a>
            <a className="button button--ghost" href={gisUrl} target="_blank" rel="noreferrer">2GIS</a>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <article className="panel info-card">
          <strong>Основная информация</strong>
          <ul className="info-list">
            <li><span>Адрес</span><strong>{listing.address || 'Уточняется'}</strong></li>
            <li><span>Часы работы</span><strong>{listing.hours || 'Уточняется'}</strong></li>
            <li><span>Стоимость</span><strong>{listing.priceLabel || 'Смотри описание'}</strong></li>
            <li><span>Можно с детьми</span><strong>{listing.childFriendly ? 'Да' : 'Не указано'}</strong></li>
            <li><span>Можно с животными</span><strong>{listing.petFriendly ? 'Да' : 'Не указано'}</strong></li>
          </ul>
        </article>

        <article className="panel info-card">
          <strong>Особенности</strong>
          <div className="chip-row">
            {listing.listingType ? <span className="chip">{listing.listingType}</span> : null}
            {listing.cuisine ? <span className="chip">{listing.cuisine}</span> : null}
            {listing.services.map((service) => (
              <span key={service} className="chip">{service}</span>
            ))}
            {listing.tags.map((tag) => (
              <span key={tag} className="chip chip--soft">{tag}</span>
            ))}
          </div>
          {listing.extra.length > 0 ? (
            <div className="extra-grid">
              {listing.extra.map((value) => (
                <div key={value} className="extra-grid__item">
                  <span>Дополнительно</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <section className="panel">
        <div className="section-headline">
          <strong>Карта</strong>
          <a href={mapUrl} target="_blank" rel="noreferrer">Открыть маршрут</a>
        </div>
        <div className="map-frame-wrap">
          <iframe title={`Карта ${listing.title}`} src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="panel">
          <div className="section-headline">
            <strong>Похожие места</strong>
            <Link to={category.id === 'restaurants' ? '/restaurants' : category.id === 'wellness' ? '/wellness' : `/section/${category.slug}`}>Все в разделе</Link>
          </div>
          <div className="listing-grid listing-grid--compact">
            {similar.map((item) => (
              <ListingCard key={item.id} listing={item} accent={category.accent} isFavorite={isFavorite(item.slug)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
