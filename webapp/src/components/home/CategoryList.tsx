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
    <section className="category-section category-section--all">
      <div className="section-heading section-heading--poster">
        <div>
          <span className="eyebrow">Навигация</span>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="category-list category-list--plain" role="list">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.path}
            className="category-list__row"
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
            <div className="category-list__row-main">
              <CategoryIcon categoryId={category.id} size="md" className="category-list__row-icon" />
              <div className="category-list__row-text">
                <strong>{category.title}</strong>
                {category.description ? <span>{category.description}</span> : null}
              </div>
            </div>

            <div className="category-list__row-side">
              {category.badge ? <span className="category-list__badge category-list__badge--inline">{category.badge}</span> : null}
              <span className="category-list__row-arrow" aria-hidden="true">›</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
