import { Link } from 'react-router-dom';
import type { GuideCategory, GuideCollection, GuidePlace, GuideTip, HomeSectionTitles } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { recordGuideAnalytics } from '../../utils/analytics';

type FeatureGridProps = {
  popularPlaces: GuidePlace[];
  featuredCategories: GuideCategory[];
  tips: GuideTip[];
  collections: GuideCollection[];
  sectionTitles: HomeSectionTitles;
};

const tones = ['orange', 'blue', 'pink', 'green', 'red', 'teal'] as const;

function getPlacePath(place: GuidePlace) {
  return `/place/${place.slug || `${place.categoryId}-${place.id}`}`;
}

export function FeatureGrid({
  popularPlaces,
  featuredCategories,
  tips,
  collections,
  sectionTitles
}: FeatureGridProps) {
  return (
    <section className="home-showcase" aria-label="Главное меню">
      <div className="home-column home-column--popular">
        <div className="home-section-title">{sectionTitles.popular}</div>
        <div className="poster-grid poster-grid--two">
          {popularPlaces.map((place, index) => (
            <Link
              key={place.id}
              to={getPlacePath(place)}
              className={`poster-tile poster-tile--${index % 2 === 0 ? 'coast' : 'bridge'}`}
              style={place.imageSrc ? { backgroundImage: `url(${place.imageGallery?.[0] ?? place.imageSrc})` } : undefined}
              onClick={() =>
                recordGuideAnalytics({
                  kind: 'place-click',
                  label: place.title,
                  path: getPlacePath(place),
                  entityId: place.id,
                  categoryId: place.categoryId
                })
              }
            >
              <strong>{place.title}</strong>
              <span>{place.imageLabel}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-column home-column--categories">
        <div className="home-section-title">{sectionTitles.categories}</div>
        <div className="tile-grid">
          {featuredCategories.map((category, index) => (
            <Link
              key={category.id}
              to={category.path}
              className={`menu-tile menu-tile--${tones[index % tones.length]}`}
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
              {category.imageSrc ? <span className="menu-tile__cover" style={{ backgroundImage: `url(${category.imageSrc})` }} aria-hidden="true" /> : null}
              <span className="menu-tile__icon" aria-hidden="true">
                <CategoryIcon categoryId={category.id} size="md" />
              </span>
              <span className="menu-tile__label">{category.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-column home-column--tips">
        <div className="home-section-title">{sectionTitles.tips}</div>
        <div className="tips-list">
          {tips.map((tip) => (
            <Link
              key={tip.id}
              to={tip.linkPath}
              className="tips-list__item"
              onClick={() =>
                recordGuideAnalytics({
                  kind: 'tip-click',
                  label: tip.title,
                  path: tip.linkPath,
                  entityId: tip.id
                })
              }
            >
              <strong>{tip.title}</strong>
              <span>{tip.text}</span>
            </Link>
          ))}
        </div>

        {collections.length > 0 ? (
          <div className="home-collections">
            <div className="home-section-title home-section-title--small">{sectionTitles.collections}</div>
            <div className="tips-list">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={collection.linkPath}
                  className="tips-list__item tips-list__item--collection"
                  onClick={() =>
                    recordGuideAnalytics({
                      kind: 'collection-click',
                      label: collection.title,
                      path: collection.linkPath,
                      entityId: collection.id
                    })
                  }
                >
                  <strong>{collection.title}</strong>
                  <span>{collection.description}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
