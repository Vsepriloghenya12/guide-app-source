import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { sectionTitles } from '../data/categories';

export function CategoryPlaceholderPage() {
  const { slug = '' } = useParams();
  const title = sectionTitles[slug] ?? 'Раздел';

  return (
    <div className="page-stack">
      <PageHeader
        title={title}
        subtitle="Здесь пока стоят аккуратные заглушки. Дальше можно наполнить раздел карточками, фильтрами, картой, подборками и внутренними страницами."
        showBack
      />

      <section className="card card--placeholder">
        <div className="placeholder-state">
          <span className="placeholder-state__badge">Скоро наполним</span>
          <h2>{title}</h2>
          <p>
            Каркас раздела уже предусмотрен. На следующем этапе сюда можно добавить карточки,
            фильтры, карту, избранное, отзывы, фотографии и отдельные страницы объектов.
          </p>
          <div className="placeholder-state__actions">
            <Link className="button button--primary" to="/">
              На главную
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
