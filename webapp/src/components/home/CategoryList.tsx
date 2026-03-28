import { Link } from 'react-router-dom';
import type { GuideCategory, GuidePlace } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';

type CategoryListProps = {
  categories: GuideCategory[];
  places: GuidePlace[];
  title: string;
};

function resolveCategoryImage(category: GuideCategory, places: GuidePlace[]) {
  if (category.imageSrc) {
    return category.imageSrc;
  }

  const place = places.find((item) => item.categoryId === category.id && (item.imageGallery?.[0] || item.imageSrc));
  return place?.imageGallery?.[0] || place?.imageSrc || '/danang-clean-poster.png';
}

export function CategoryList({ categories, places, title }: CategoryListProps) {
  return (
    <section className="travel-home-section travel-home-section--categories" id="all-categories">
      <div className="travel-home-section__header">
        <h2>{title}</h2>
      </div>

      <div className="travel-category-photo-grid" role="list">
        {categories.map((category) => {
          const imageSrc = resolveCategoryImage(category, places);
          return (
            <Link
              key={category.id}
              to={category.path}
              className="travel-category-photo-card"
              role="listitem"
              style={{ backgroundImage: `url(${imageSrc})` }}
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
              <span className="travel-category-photo-card__shade" />
              <span className="travel-category-photo-card__label">{category.shortTitle || category.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
