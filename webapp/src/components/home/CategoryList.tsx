import { Link } from 'react-router-dom';
import type { GuideCategory } from '../../types';

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
          <Link key={category.id} to={category.path} className="category-list__item">
            <div className="category-list__text">
              <strong>{category.title}</strong>
              {category.description ? <span>{category.description}</span> : null}
            </div>
            {category.badge ? (
              <div className="category-list__meta">
                <span className="category-list__badge">{category.badge}</span>
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
