import { Link } from 'react-router-dom';
import type { Listing } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';


type ListingCardProps = {
  listing: Listing;
  accent?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
};

function buildMeta(listing: Listing) {
  return [
    listing.shortDescription,
    listing.hours ? `Open ${listing.hours}` : '',
    listing.district || listing.address,
    listing.priceLabel || ''
  ]
    .filter(Boolean)
    .slice(0, 2);
}

export function ListingCard({ listing, isFavorite, onToggleFavorite }: ListingCardProps) {
  const image = listing.imageUrls[0] || '/danang-clean-poster.png';
  const detailPath = `/place/${listing.slug}`;
  const meta = buildMeta(listing);

  return (
    <article className="travel-list-card">
      <Link
        className="travel-list-card__main"
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
        <span className="travel-list-card__thumb-wrap">
          <img className="travel-list-card__thumb" src={image} alt={listing.title} loading="lazy" decoding="async" />
        </span>

        <span className="travel-list-card__body">
          <strong>{listing.title}</strong>
          {meta[0] ? <span className="travel-list-card__subtitle">{meta[0]}</span> : null}
          <span className="travel-list-card__meta">
            {listing.rating ? <span>{listing.rating.toFixed(1)} ★</span> : null}
            {meta[1] ? <span>{meta[1]}</span> : null}
          </span>
        </span>

        <span className="travel-list-card__right">
          {onToggleFavorite ? (
            <button
              className={`travel-list-card__save${isFavorite ? ' is-active' : ''}`}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleFavorite(listing.slug);
              }}
              aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          ) : null}
          <span className="travel-list-card__arrow" aria-hidden="true">›</span>
        </span>
      </Link>
    </article>
  );
}
