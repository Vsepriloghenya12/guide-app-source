import { Link } from 'react-router-dom';
import type { GuideCategory } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';
import { getCategoryListImage } from './homeVisuals';

type CategoryListProps = {
  categories: GuideCategory[];
  title: string;
};

export function CategoryList({ categories, title }: CategoryListProps) {
  return (
    <section className="travel-section travel-section--directory" id="all-categories">
      <div className="travel-section__header">
        <h2>{title}</h2>
      </div>

      <div className="travel-directory-list travel-directory-list--stripes" role="list">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to={category.path}
            className="travel-directory-row"
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
            <span className="travel-directory-row__title">{category.shortTitle || category.title}</span>
            <span className="travel-directory-row__media" aria-hidden="true">
              <img src={getCategoryListImage(category, index)} alt="" loading="lazy" decoding="async" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
