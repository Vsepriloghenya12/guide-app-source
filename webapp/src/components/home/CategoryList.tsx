import { Link } from 'react-router-dom';
import { homeCategories } from '../../data/categories';

export function CategoryList() {
  return (
    <section className="category-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Навигация</span>
          <h2>Все категории</h2>
        </div>
      </div>

      <div className="category-list category-list--grid">
        {homeCategories.map((category) => (
          <Link key={category.id} to={category.path} className="category-list__item">
            <div className="category-list__text">
              <strong>{category.title}</strong>
            </div>
            <div className="category-list__meta">
              {category.badge ? <span className="category-list__badge">{category.badge}</span> : null}
              <span className="category-list__arrow">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
