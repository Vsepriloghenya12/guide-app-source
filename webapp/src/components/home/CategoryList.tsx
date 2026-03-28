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
    <section className="travel-section travel-section--directory" id="all-categories">
      <div className="travel-section__header">
        <h2>{title}</h2>
      </div>

      <div className="travel-directory-list" role="list">
        {categories.map((category) => {
          const imageSrc = resolveCategoryImage(category, places);
          const placesCount = places.filter((item) => item.categoryId === category.id && item.status === 'published').length;
          const meta = category.description || (placesCount > 0 ? `${placesCount} мест в разделе` : 'Раздел пока наполняется');
          return (
            <Link
              key={category.id}
              to={category.path}
              className="travel-directory-item"
              role="listitem"
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
              <span className="travel-directory-item__thumb" aria-hidden="true">
                <img src={imageSrc} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="travel-directory-item__body">
                <strong>{category.shortTitle || category.title}</strong>
                <span>{meta}</span>
              </span>
              <span className="travel-directory-item__arrow" aria-hidden="true">
                ›
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
