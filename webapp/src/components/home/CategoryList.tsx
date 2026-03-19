import { Link } from 'react-router-dom';
import { homeCategories } from '../../data/categories';

export function CategoryList() {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Категории</span>
          <h2>Основные разделы приложения</h2>
        </div>
      </div>

      <div className="category-list">
        {homeCategories.map((category) => (
          <Link key={category.id} to={category.path} className="category-list__item">
            <div className="category-list__text">
              <strong>{category.title}</strong>
              <span>Карточки и наполнение можно расширять отдельно в этом разделе.</span>
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
