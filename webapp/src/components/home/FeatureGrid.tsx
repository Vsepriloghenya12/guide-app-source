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

const tones = ['blue', 'orange', 'teal', 'pink', 'indigo', 'gold'] as const;

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
      text: [event.shortDescription, event.hours, event.address || event.district].filter(Boolean).join(' · '),
      path: getPlacePath(event),
      imageSrc: event.imageGallery?.[0] || event.imageSrc,
      kind: 'event' as const
    }))
  ].slice(0, 5);
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
    <section className="reference-home">
      {quickCategories.length > 0 ? (
        <section className="reference-section reference-section--categories" aria-label={sectionTitles.categories}>
          <div className="reference-category-grid">
            {quickCategories.map((category, index) => (
              <Link
                key={category.id}
                to={category.path}
                className={`reference-category-tile reference-category-tile--${tones[index % tones.length]}`}
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
                <span className="reference-category-tile__icon" aria-hidden="true">
                  <CategoryIcon categoryId={category.id} size="lg" />
                </span>
                <span className="reference-category-tile__label">{category.shortTitle || category.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="reference-section">
        <div className="reference-section__header">
          <h2>{sectionTitles.popular}</h2>
          <Link to="/search">See All ›</Link>
        </div>

        <div className="reference-picks-grid">
          {popularPlaces.slice(0, 3).map((place) => {
            const imageSrc = place.imageGallery?.[0] || place.imageSrc || '/danang-clean-poster.png';
            const detailPath = getPlacePath(place);
            return (
              <Link
                key={place.id}
                to={detailPath}
                className="reference-pick-card"
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
                <span className="reference-pick-card__shade" />
                <span className="reference-pick-card__content">
                  <strong>{place.title}</strong>
                  <span>{place.imageLabel || place.shortDescription || 'Top Pick'}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {storyCards.length > 0 ? (
        <section className="reference-section">
          <div className="reference-section__header">
            <h2>{sectionTitles.tips}</h2>
            <Link to="/help">Open ›</Link>
          </div>

          <div className="reference-story-list">
            {storyCards.map((item, index) => (
              <Link
                key={item.id}
                to={item.path}
                className="reference-story-card"
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
                  className={`reference-story-card__thumb reference-story-card__thumb--${tones[index % tones.length]}`}
                  style={item.imageSrc ? { backgroundImage: `url(${item.imageSrc})` } : undefined}
                  aria-hidden="true"
                />
                <span className="reference-story-card__content">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </span>
                <span className="reference-story-card__arrow" aria-hidden="true">
                  ›
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
