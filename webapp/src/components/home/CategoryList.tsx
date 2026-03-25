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

      <div className="category-list category-list--grid">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.path}
            className="category-list__item"
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
            {category.imageSrc ? <div className="category-list__cover" style={{ backgroundImage: `url(${category.imageSrc})` }} aria-hidden="true" /> : null}
            {category.badge ? <span className="category-list__badge category-list__badge--floating">{category.badge}</span> : null}
            <div className="category-list__main">
              <CategoryIcon categoryId={category.id} size="md" />
              <div className="category-list__text">
                <strong>{category.title}</strong>
                {category.description ? <span>{category.description}</span> : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
