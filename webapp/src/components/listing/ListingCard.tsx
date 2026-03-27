import { Link } from 'react-router-dom';
import type { Listing } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';
import { createGoogleDirectionsUrl } from '../../utils/places';

type ListingCardProps = {
  listing: Listing;
  accent?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
};

function buildMeta(listing: Listing) {
  return [
    listing.district || listing.address,
    listing.listingType || listing.type,
    typeof listing.hotelStars === 'number' ? `${listing.hotelStars}★` : '',
    listing.priceLabel || ''
  ].filter(Boolean).slice(0, 3);
}

export function ListingCard({ listing, accent = 'orange', isFavorite, onToggleFavorite }: ListingCardProps) {
  const image = listing.imageUrls[0] || '/danang-clean-poster.png';
  const detailPath = `/place/${listing.slug}`;
  const routeUrl = createGoogleDirectionsUrl(listing);
  const meta = buildMeta(listing);
  const secondaryTags = [
    listing.cuisine,
    listing.hotelPool ? 'Бассейн' : '',
    listing.hotelSpa ? 'СПА' : '',
    listing.childFriendly ? 'С детьми' : '',
    listing.petFriendly ? 'С животными' : '',
    ...(listing.tags || [])
  ].filter(Boolean).slice(0, 2) as string[];

  return (
    <article className={`listing-card listing-card--enhanced ${accent ? `listing-card--${accent}` : ''}`}>
      <Link
        className="listing-card__link"
        to={detailPath}
        onClick={() =>
          recordGuideAnalytics({
            kind: 'place-click',
            label: listing.title,
            path: detailPath,
            entityId: listing.id,
            categoryId: listing.categoryId
          })
        }
      >
        <div className="listing-card__media">
          <img src={image} alt={listing.title} loading="lazy" decoding="async" />
          <div className="listing-card__media-badges">
            {listing.featured ? <span className="listing-card__badge">Топ</span> : null}
            {listing.priceLabel ? <span className="listing-card__badge listing-card__badge--soft">{listing.priceLabel}</span> : null}
          </div>
        </div>

        <div className="listing-card__body">
          <div className="listing-card__top">
            <div>
              <h3>{listing.title}</h3>
              <p>{listing.shortDescription}</p>
            </div>
            <span className="rating-pill">★ {listing.rating.toFixed(1)}</span>
          </div>

          {meta.length > 0 ? (
            <div className="listing-card__meta listing-card__meta--compact">
              {meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}

          {secondaryTags.length > 0 ? (
            <div className="chip-row listing-card__chips">
              {secondaryTags.map((tag) => (
                <span key={tag} className="chip chip--soft">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="listing-card__actions">
        <a className="button button--primary button--small" href={routeUrl} target="_blank" rel="noreferrer">
          Маршрут
        </a>
        {listing.phoneNumber ? (
          <a
            className="button button--ghost button--small"
            href={`tel:${listing.phoneNumber}`}
            onClick={() =>
              recordGuideAnalytics({
                kind: 'phone-click',
                label: `${listing.title} · звонок`,
                path: `tel:${listing.phoneNumber}`,
                entityId: listing.id,
                categoryId: listing.categoryId
              })
            }
          >
            Позвонить
          </a>
        ) : listing.websiteUrl ? (
          <a
            className="button button--ghost button--small"
            href={listing.websiteUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              recordGuideAnalytics({
                kind: 'website-click',
                label: `${listing.title} · сайт`,
                path: listing.websiteUrl,
                entityId: listing.id,
                categoryId: listing.categoryId
              })
            }
          >
            Сайт
          </a>
        ) : (
          <Link className="button button--ghost button--small" to={detailPath}>
            Подробнее
          </Link>
        )}
        {onToggleFavorite ? (
          <button className={`button button--ghost button--small${isFavorite ? ' is-active' : ''}`} type="button" onClick={() => onToggleFavorite(listing.slug)}>
            {isFavorite ? '♥' : '♡'}
          </button>
        ) : null}
      </div>
    </article>
  );
}
