import { Link } from 'react-router-dom';
import type { Listing } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';


type ListingCardProps = {
  listing: Listing;
  accent?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
  variant?: 'default' | 'restaurant';
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

function buildUnifiedFacts(listing: Listing, averageCheckLabel: string, workingHoursLabel: string) {
  const primaryFact =
    listing.categoryId === 'restaurants'
      ? { tone: 'check', label: 'Средний чек', value: averageCheckLabel }
      : typeof listing.hotelStars === 'number' && Number.isFinite(listing.hotelStars)
        ? { tone: 'check', label: 'Уровень', value: `${listing.hotelStars}★` }
        : listing.cuisine
          ? { tone: 'check', label: 'Кухня', value: listing.cuisine }
          : listing.listingType || listing.kind
            ? { tone: 'check', label: 'Формат', value: listing.listingType || listing.kind }
            : listing.priceLabel
              ? { tone: 'check', label: 'Цена', value: listing.priceLabel }
              : null;

  const secondaryFact = listing.hours
    ? { tone: 'hours', label: 'Время работы', value: workingHoursLabel }
    : listing.district
      ? { tone: 'hours', label: 'Район', value: listing.district }
      : listing.address
        ? { tone: 'hours', label: 'Адрес', value: listing.address }
        : null;

  return [primaryFact, secondaryFact].filter((fact): fact is { tone: 'check' | 'hours'; label: string; value: string } => Boolean(fact));
}

export function ListingCard({ listing, accent, isFavorite, onToggleFavorite, variant = 'default' }: ListingCardProps) {
  const image = listing.imageUrls[0] || '/home-hero-background.png';
  const detailPath = `/place/${listing.slug}`;
  const meta = buildMeta(listing);
  const pills = buildPills(listing);
  const badgeLabel = buildBadgeLabel(listing);
  const averageCheckLabel =
    listing.priceLabel || (typeof listing.avgCheck === 'number' && Number.isFinite(listing.avgCheck) ? `от ${listing.avgCheck}` : 'не указан');
  const workingHoursLabel = listing.hours || 'не указано';
  const unifiedFacts = buildUnifiedFacts(listing, averageCheckLabel, workingHoursLabel);

  if (variant === 'restaurant') {
    return (
      <article className="travel-list-card travel-list-card--restaurant" data-tone={accent || 'coast'}>
        <Link
          className="travel-list-card__main travel-list-card__main--restaurant"
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
          <span className="travel-list-card__thumb-wrap travel-list-card__thumb-wrap--restaurant">
            <img className="travel-list-card__thumb" src={image} alt={listing.title} loading="lazy" decoding="async" />
          </span>

          <span className="travel-list-card__body travel-list-card__body--restaurant">
            <strong className="travel-list-card__title--restaurant">{listing.title}</strong>
            {meta[0] ? <span className="travel-list-card__subtitle travel-list-card__subtitle--restaurant">{meta[0]}</span> : null}
            <span className="travel-list-card__restaurant-meta">
              {unifiedFacts.map((fact) => (
                <span key={`${fact.label}-${fact.value}`} className={`travel-list-card__restaurant-fact travel-list-card__restaurant-fact--${fact.tone}`}>
                  <span className="travel-list-card__restaurant-fact-label">{fact.label}</span>
                  <span className="travel-list-card__restaurant-fact-value">{fact.value}</span>
                </span>
              ))}
            </span>
          </span>
        </Link>
      </article>
    );
  }

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
