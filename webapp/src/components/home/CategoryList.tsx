import { Link } from 'react-router-dom';
import type { GuideCategory } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { recordGuideAnalytics } from '../../utils/analytics';

type CategoryListProps = {
  categories: GuideCategory[];
  title: string;
};

export function CategoryList({ categories, title }: CategoryListProps) {
  return (
    <section className="travel-section travel-section--directory" id="all-categories">
      <div className="travel-section__header">
        <h2>{title}</h2>
        <span>{categories.length}</span>
      </div>

      <div className="travel-directory-list" role="list">
        {categories.map((category) => (
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
              {category.imageSrc ? <img src={category.imageSrc} alt="" loading="lazy" decoding="async" /> : <CategoryIcon categoryId={category.id} size="lg" />}
            </span>
            <span className="travel-directory-item__body">
              <strong>{category.shortTitle || category.title}</strong>
              <span>{category.description || 'Open places and useful tips in this section.'}</span>
            </span>
            <span className="travel-directory-item__arrow" aria-hidden="true">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
