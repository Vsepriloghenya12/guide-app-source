import { Link } from 'react-router-dom';
import { homeCategories } from '../../data/categories';

export function CategoryList() {
  return (
    <section className="category-section category-section--all">
      <div className="section-heading section-heading--poster">
        <div>
          <span className="eyebrow">Навигация</span>
          <h2>Все рубрики</h2>
        </div>
      </div>

      <div className="category-list category-list--grid">
        {homeCategories.map((category) => (
          <Link key={category.id} to={category.path} className="category-list__item">
            <div className="category-list__text">
              <strong>{category.title}</strong>
              <span>{category.subtitle}</span>
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
