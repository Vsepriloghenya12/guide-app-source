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
    listing.shortDescription || listing.description,
    listing.district || listing.address
  ].filter(Boolean);
}

function buildPills(listing: Listing) {
  return [
    listing.rating ? `${listing.rating.toFixed(1)} ★` : '',
    listing.priceLabel || '',
    listing.hours ? `Открыто ${listing.hours}` : ''
  ]
    .filter(Boolean)
    .slice(0, 3);
}

function buildBadgeLabel(listing: Listing) {
  return listing.listingType || listing.kind || listing.cuisine || 'Место';
}

export function ListingCard({ listing, accent, isFavorite, onToggleFavorite }: ListingCardProps) {
  const image = listing.imageUrls[0] || '/home-hero-background.png';
  const detailPath = `/place/${listing.slug}`;
  const meta = buildMeta(listing);
  const pills = buildPills(listing);
  const badgeLabel = buildBadgeLabel(listing);

  return (
    <article className="travel-list-card" data-tone={accent || 'coast'}>
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
          <span className="travel-list-card__thumb-badge">{badgeLabel}</span>
        </span>

        <span className="travel-list-card__body">
          <strong>{listing.title}</strong>
          {meta[0] ? <span className="travel-list-card__subtitle">{meta[0]}</span> : null}
          {pills.length > 0 ? (
            <span className="travel-list-card__pills">
              {pills.map((item, index) => (
                <span key={`${item}-${index}`} className="travel-list-card__pill">{item}</span>
              ))}
            </span>
          ) : null}
          {meta[1] ? <span className="travel-list-card__meta">{meta[1]}</span> : null}
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
