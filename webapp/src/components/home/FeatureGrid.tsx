import { Link } from 'react-router-dom';
import type { GuideCategory, GuideCollection, GuidePlace, GuideTip, HomeSectionTitles } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';
import { getCategoryTone, getPlaceTone, getQuickMenuImage } from './homeVisuals';

type FeatureGridProps = {
  popularPlaces: GuidePlace[];
  featuredCategories: GuideCategory[];
  tips: GuideTip[];
  collections: GuideCollection[];
  upcomingEvents: GuidePlace[];
  sectionTitles: HomeSectionTitles;
};

type StoryCard = {
  id: string;
  title: string;
  text: string;
  path: string;
  imageSrc?: string;
  kind: 'tip' | 'collection' | 'event';
};

function getPlacePath(place: GuidePlace) {
  return `/place/${place.slug || `${place.categoryId}-${place.id}`}`;
}

function buildStoryCards(tips: GuideTip[], collections: GuideCollection[], upcomingEvents: GuidePlace[]): StoryCard[] {
  return [
    ...tips.map((tip) => ({
      id: tip.id,
      title: tip.title,
      text: tip.text,
      path: tip.linkPath,
      kind: 'tip' as const
    })),
    ...collections.map((collection) => ({
      id: collection.id,
      title: collection.title,
      text: collection.description,
      path: collection.linkPath,
      imageSrc: collection.imageSrc,
      kind: 'collection' as const
    })),
    ...upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      text: [event.shortDescription, event.address || event.district, event.hours].filter(Boolean).join(' · '),
      path: getPlacePath(event),
      imageSrc: event.imageGallery?.[0] || event.imageSrc,
      kind: 'event' as const
    }))
  ].slice(0, 5);
}
const storyKindLabel: Record<StoryCard['kind'], string> = {
  tip: 'Совет',
  collection: 'Подборка',
  event: 'Событие'
};

export function FeatureGrid({ popularPlaces, featuredCategories, tips, collections, upcomingEvents, sectionTitles }: FeatureGridProps) {
  const quickCategories = featuredCategories.slice(0, 4);
  const storyCards = buildStoryCards(tips, collections, upcomingEvents);

  return (
    <section className="travel-home-sections">
      {quickCategories.length > 0 ? (
        <section className="travel-section travel-section--quick" aria-label="Быстрые рубрики">
          <div className="travel-quick-grid travel-quick-grid--four">
            {quickCategories.map((category, index) => (
              <Link
                key={category.id}
                to={category.path}
                className="travel-quick-photo"
                data-tone={getCategoryTone(category)}
                onClick={() =>
                  recordGuideAnalytics({
                    kind: 'category-click',
                    label: category.title,
                    path: category.path,
                    entityId: category.id,
                    categoryId: category.id
                  })
                }
                >
                  <span className="travel-quick-photo__disc" aria-hidden="true">
                    <img src={getQuickMenuImage(category, index)} alt="" loading="lazy" decoding="async" />
                  </span>
                  {category.badge ? <span className="travel-quick-photo__meta">{category.badge}</span> : null}
                  <span className="travel-quick-photo__label">{category.shortTitle || category.title}</span>
                </Link>
              ))}
          </div>
        </section>
      ) : null}

      {popularPlaces.length > 0 ? (
        <section className="travel-section">
          <div className="travel-section__header">
            <h2>{sectionTitles.popular || 'Топ'}</h2>
            <Link to="/search">Смотреть все</Link>
          </div>

          <div className="travel-picks-row">
            {popularPlaces.slice(0, 3).map((place) => {
              const imageSrc = place.imageGallery?.[0] || place.imageSrc || '/home-hero-background.png';
              const detailPath = getPlacePath(place);
              const badgeLabel = place.listingType || place.kind || place.cuisine || 'Место';
              const metaLabel = place.district || place.priceLabel || place.hours || place.shortDescription || '';
              return (
                <Link
                  key={place.id}
                  to={detailPath}
                  className="travel-pick-card"
                  data-tone={getPlaceTone(place.categoryId)}
                  style={{ backgroundImage: `url(${imageSrc})` }}
                  onClick={() =>
                    recordGuideAnalytics({
                      kind: 'place-click',
                      label: place.title,
                      path: detailPath,
                      entityId: place.id,
                      categoryId: place.categoryId
                    })
                  }
                >
                  <span className="travel-pick-card__shade" />
                  {place.rating ? <span className="travel-pick-card__rating">{place.rating.toFixed(1)} ★</span> : null}
                  <span className="travel-pick-card__content">
                    <span className="travel-pick-card__eyebrow">{badgeLabel}</span>
                    <strong>{place.title}</strong>
                    {metaLabel ? <span>{metaLabel}</span> : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {storyCards.length > 0 ? (
        <section className="travel-section">
          <div className="travel-section__header">
            <h2>{sectionTitles.tips || 'Советы'}</h2>
            <Link to="/help">Открыть</Link>
          </div>

          <div className="travel-story-list travel-story-list--plain">
            {storyCards.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="travel-story-row"
                data-tone={item.kind === 'collection' ? 'bridge' : item.kind === 'event' ? getPlaceTone('events') : 'emerald'}
                onClick={() =>
                  recordGuideAnalytics({
                    kind: item.kind === 'collection' ? 'collection-click' : item.kind === 'event' ? 'place-click' : 'tip-click',
                    label: item.title,
                    path: item.path,
                    entityId: item.id
                  })
                }
              >
                <span
                  className="travel-story-row__thumb"
                  style={item.imageSrc ? { backgroundImage: `url(${item.imageSrc})` } : { backgroundImage: 'url(/home-hero-background.png)' }}
                  aria-hidden="true"
                />
                <span className="travel-story-row__body">
                  <span className="travel-story-row__eyebrow">{storyKindLabel[item.kind]}</span>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </span>
                <span className="travel-story-row__arrow" aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
