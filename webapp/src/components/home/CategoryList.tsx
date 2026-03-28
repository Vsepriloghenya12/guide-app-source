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
    <section id="all-categories" className="reference-directory">
      <div className="reference-section__header reference-section__header--directory">
        <div>
          <span className="reference-section__eyebrow">Navigation</span>
          <h2>{title}</h2>
        </div>
        <span className="reference-directory__meta">{categories.length} categories</span>
      </div>

      <div className="reference-directory-grid" role="list">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.path}
            className="reference-directory-card"
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
            <span
              className="reference-directory-card__thumb"
              style={category.imageSrc ? { backgroundImage: `url(${category.imageSrc})` } : undefined}
              aria-hidden="true"
            >
              {!category.imageSrc ? <CategoryIcon categoryId={category.id} size="lg" className="reference-directory-card__icon" /> : null}
            </span>

            <span className="reference-directory-card__body">
              <strong>{category.shortTitle || category.title}</strong>
              <span>{category.description || 'Открой подборку мест и полезной информации по разделу.'}</span>
            </span>

            <span className="reference-directory-card__arrow" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
