import { Link } from 'react-router-dom';
import type { Listing } from '../../types';

type ListingCardProps = {
  listing: Listing;
  accent?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
};

export function ListingCard({ listing, accent = 'orange', isFavorite, onToggleFavorite }: ListingCardProps) {
  const image = listing.imageUrls[0] || '/danang-clean-poster.png';

  return (
    <article className={`listing-card ${accent ? `listing-card--${accent}` : ''}`}>
      <Link className="listing-card__link" to={`/place/${listing.slug}`}>
        <div className="listing-card__media">
          <img src={image} alt={listing.title} loading="lazy" />
          {listing.featured ? <span className="listing-card__badge">Топ</span> : null}
        </div>

        <div className="listing-card__body">
          <div className="listing-card__top">
            <div>
              <h3>{listing.title}</h3>
              <p>{listing.shortDescription}</p>
            </div>
            <span className="rating-pill">★ {listing.rating.toFixed(1)}</span>
          </div>

          <div className="listing-card__meta">
            <span>{listing.address}</span>
            {listing.priceLabel ? <span>{listing.priceLabel}</span> : null}
          </div>

          <div className="chip-row">
            {listing.listingType ? <span className="chip">{listing.listingType}</span> : null}
            {listing.cuisine ? <span className="chip">{listing.cuisine}</span> : null}
            {listing.childFriendly ? <span className="chip">С детьми</span> : null}
            {listing.petFriendly ? <span className="chip">С животными</span> : null}
            {listing.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="chip chip--soft">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {onToggleFavorite ? (
        <button className={`favorite-button${isFavorite ? ' is-active' : ''}`} type="button" onClick={() => onToggleFavorite(listing.slug)}>
          {isFavorite ? '♥' : '♡'}
        </button>
      ) : null}
    </article>
  );
}
