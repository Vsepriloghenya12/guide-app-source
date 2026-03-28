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
    listing.listingType || listing.type,
    listing.district || listing.address,
    typeof listing.hotelStars === 'number' ? `${listing.hotelStars}★` : '',
    listing.priceLabel || ''
  ].filter(Boolean).slice(0, 3);
}

export function ListingCard({ listing, accent = 'orange', isFavorite, onToggleFavorite }: ListingCardProps) {
  const image = listing.imageUrls[0] || '/danang-clean-poster.png';
  const detailPath = `/place/${listing.slug}`;
  const routeUrl = createGoogleDirectionsUrl(listing);
  const meta = buildMeta(listing);

  return (
    <article className={`reference-listing-card reference-listing-card--${accent}`}>
      <Link
        className="reference-listing-card__main"
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
        <span className="reference-listing-card__thumb-wrap">
          <img className="reference-listing-card__thumb" src={image} alt={listing.title} loading="lazy" decoding="async" />
        </span>

        <span className="reference-listing-card__body">
          <span className="reference-listing-card__title-row">
            <strong>{listing.title}</strong>
            <span className="reference-listing-card__rating">{listing.rating.toFixed(1)}</span>
          </span>
          <span className="reference-listing-card__summary">{listing.shortDescription}</span>
          {meta.length > 0 ? <span className="reference-listing-card__meta">{meta.join(' · ')}</span> : null}
        </span>

        <span className="reference-listing-card__arrow" aria-hidden="true">
          ›
        </span>
      </Link>

      <div className="reference-listing-card__actions">
        <a className="reference-mini-button reference-mini-button--primary" href={routeUrl} target="_blank" rel="noreferrer">
          Directions
        </a>

        {onToggleFavorite ? (
          <button
            className={`reference-mini-button reference-mini-button--ghost${isFavorite ? ' is-active' : ''}`}
            type="button"
            onClick={() => onToggleFavorite(listing.slug)}
          >
            {isFavorite ? '♥ Saved' : '♡ Save'}
          </button>
        ) : listing.websiteUrl ? (
          <a className="reference-mini-button reference-mini-button--ghost" href={listing.websiteUrl} target="_blank" rel="noreferrer">
            Website
          </a>
        ) : null}
      </div>
    </article>
  );
}
