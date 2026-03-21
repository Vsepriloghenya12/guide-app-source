import { Link } from 'react-router-dom';
import type { GuideCategory, GuideCollection, GuidePlace, GuideTip, HomeSectionTitles } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';

type FeatureGridProps = {
  popularPlaces: GuidePlace[];
  featuredCategories: GuideCategory[];
  tips: GuideTip[];
  collections: GuideCollection[];
  sectionTitles: HomeSectionTitles;
};

const tones = ['orange', 'blue', 'pink', 'green', 'red', 'teal'] as const;

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
              to={place.categoryId === 'restaurants' ? '/restaurants' : place.categoryId === 'wellness' ? '/wellness' : `/section/${place.categoryId}`}
              className={`poster-tile poster-tile--${index % 2 === 0 ? 'coast' : 'bridge'}`}
              style={place.imageSrc ? { backgroundImage: `url(${place.imageGallery?.[0] ?? place.imageSrc})` } : undefined}
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
            <Link key={category.id} to={category.path} className={`menu-tile menu-tile--${tones[index % tones.length]}`}>
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
            <Link key={tip.id} to={tip.linkPath} className="tips-list__item">
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
                <Link key={collection.id} to={collection.linkPath} className="tips-list__item tips-list__item--collection">
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
