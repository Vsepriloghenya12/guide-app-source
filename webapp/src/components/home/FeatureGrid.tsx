import { Link } from 'react-router-dom';
import type { GuideCategory, GuideCollection, GuidePlace, GuideTip, HomeSectionTitles } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { recordGuideAnalytics } from '../../utils/analytics';

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

const tones = ['blue', 'orange', 'teal', 'pink', 'green', 'red'] as const;

function getPlacePath(place: GuidePlace) {
  return `/place/${place.slug || `${place.categoryId}-${place.id}`}`;
}

function buildStoryCards(tips: GuideTip[], collections: GuideCollection[], upcomingEvents: GuidePlace[]): StoryCard[] {
  const tipCards = tips.map((tip) => ({
    id: tip.id,
    title: tip.title,
    text: tip.text,
    path: tip.linkPath,
    kind: 'tip' as const
  }));

  const collectionCards = collections.map((collection) => ({
    id: collection.id,
    title: collection.title,
    text: collection.description,
    path: collection.linkPath,
    imageSrc: collection.imageSrc,
    kind: 'collection' as const
  }));

  const eventCards = upcomingEvents.map((event) => ({
    id: event.id,
    title: event.title,
    text: [event.hours, event.address || event.district].filter(Boolean).join(' · ') || 'Событие в Дананге',
    path: getPlacePath(event),
    imageSrc: event.imageGallery?.[0] || event.imageSrc,
    kind: 'event' as const
  }));

  return [...tipCards, ...collectionCards, ...eventCards].slice(0, 4);
}

export function FeatureGrid({
  popularPlaces,
  featuredCategories,
  tips,
  collections,
  upcomingEvents,
  sectionTitles
}: FeatureGridProps) {
  const quickCategories = featuredCategories.slice(0, 4);
  const storyCards = buildStoryCards(tips, collections, upcomingEvents);

  return (
    <section className="home-showcase travel-home-card" aria-label="Главное меню">
      {quickCategories.length > 0 ? (
        <section className="travel-home-section travel-home-section--categories" aria-label={sectionTitles.categories}>
          <div className="travel-categories-grid">
            {quickCategories.map((category, index) => (
              <Link
                key={category.id}
                to={category.path}
                className={`travel-category-tile travel-category-tile--${tones[index % tones.length]}`}
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
                <span className="travel-category-tile__icon" aria-hidden="true">
                  <CategoryIcon categoryId={category.id} size="lg" />
                </span>
                <span className="travel-category-tile__label">{category.shortTitle || category.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="travel-home-section">
        <div className="travel-section-header">
          <h2>{sectionTitles.popular}</h2>
          <Link to="/search">Смотреть все</Link>
        </div>

        <div className="travel-picks-grid">
          {popularPlaces.slice(0, 3).map((place) => {
            const imageSrc = place.imageGallery?.[0] || place.imageSrc || '/danang-clean-poster.png';
            const detailPath = getPlacePath(place);
            return (
              <Link
                key={place.id}
                to={detailPath}
                className="travel-pick-card"
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
                <span className="travel-pick-card__overlay" />
                <span className="travel-pick-card__meta">{place.imageLabel || place.shortDescription || 'Рекомендуем'}</span>
                <strong>{place.title}</strong>
              </Link>
            );
          })}
        </div>
      </section>

      {storyCards.length > 0 ? (
        <section className="travel-home-section">
          <div className="travel-section-header">
            <h2>{sectionTitles.tips}</h2>
            <Link to="/search">Открыть</Link>
          </div>

          <div className="travel-story-list">
            {storyCards.map((item, index) => (
              <Link
                key={item.id}
                to={item.path}
                className={`travel-story-card travel-story-card--${item.kind}`}
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
                  className={`travel-story-card__thumb travel-story-card__thumb--${tones[index % tones.length]}`}
                  style={item.imageSrc ? { backgroundImage: `url(${item.imageSrc})` } : undefined}
                  aria-hidden="true"
                />
                <span className="travel-story-card__body">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </span>
                <span className="travel-story-card__arrow" aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
