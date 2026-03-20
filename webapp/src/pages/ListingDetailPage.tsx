import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import type { Category, Listing } from '../types';

export function ListingDetailPage() {
  const { slug = '' } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [listing, setListing] = useState<Listing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

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
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const mapUrl = useMemo(() => {
    if (!listing) return '#';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.mapQuery || listing.address || listing.title)}`;
  }, [listing]);

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

  return (
    <div className="page-stack">
      <PageHeader title={listing.title} subtitle={listing.shortDescription} showBack actionLabel={category.shortTitle} actionPath={`/category/${category.slug}`} />

      <section className="detail-hero panel">
        <div className="gallery-grid">
          {listing.imageUrls.map((imageUrl, index) => (
            <img key={`${imageUrl}-${index}`} src={imageUrl} alt={`${listing.title} ${index + 1}`} loading="lazy" />
          ))}
        </div>
        <div className="detail-hero__content">
          <div className="detail-meta-row">
            <span className="rating-pill">★ {listing.rating.toFixed(1)}</span>
            {listing.priceLabel ? <span className="chip">{listing.priceLabel}</span> : null}
            <span className="chip">{category.title}</span>
          </div>
          <p>{listing.description}</p>
          <div className="detail-actions">
            {listing.phone ? (
              <a className="button" href={`tel:${listing.phone}`}>
                Позвонить
              </a>
            ) : null}
            <a className="button button--ghost" href={mapUrl} target="_blank" rel="noreferrer">
              Открыть маршрут
            </a>
            {listing.website ? (
              <a className="button button--ghost" href={listing.website} target="_blank" rel="noreferrer">
                Сайт
              </a>
            ) : null}
            <button className={`button button--ghost${isFavorite(listing.slug) ? ' is-active' : ''}`} type="button" onClick={() => toggleFavorite(listing.slug)}>
              {isFavorite(listing.slug) ? 'Убрать из избранного' : 'В избранное'}
            </button>
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
          {Object.keys(listing.extra).length > 0 ? (
            <div className="extra-grid">
              {Object.entries(listing.extra).map(([key, value]) => (
                <div key={key} className="extra-grid__item">
                  <span>{key}</span>
                  <strong>{String(value)}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <section className="panel">
        <div className="section-headline">
          <strong>Карта</strong>
          <a href={mapUrl} target="_blank" rel="noreferrer">Открыть в Google Maps</a>
        </div>
        <div className="map-frame-wrap">
          <iframe title={`Карта ${listing.title}`} src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="panel">
          <div className="section-headline">
            <strong>Похожие места</strong>
            <Link to={`/category/${category.slug}`}>Все в разделе</Link>
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
