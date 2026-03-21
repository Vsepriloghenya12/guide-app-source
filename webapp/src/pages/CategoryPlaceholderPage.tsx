import { Link, useParams } from 'react-router-dom';
import { PlaceholderCard } from '../components/common/PlaceholderCard';
import { PageHeader } from '../components/layout/PageHeader';
import { sectionTitles } from '../data/categories';
import { useGuideContent } from '../hooks/useGuideContent';
import type { GuidePlace } from '../types';

function compactStrings(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}

function getPlaceImages(item: GuidePlace) {
  if (Array.isArray(item.imageGallery) && item.imageGallery.length > 0) {
    return item.imageGallery;
  }
  return item.imageSrc ? [item.imageSrc] : [];
}

export function CategoryPlaceholderPage() {
  const { slug = '' } = useParams();
  const { categories, places } = useGuideContent();
  const title = sectionTitles[slug] ?? 'Раздел';
  const category = categories.find((item) => item.id === slug);
  const categoryPlaces = places.filter((item) => item.categoryId === slug);

  return (
    <div className="page-stack">
      <PageHeader
        title={title}
        subtitle={
          categoryPlaces.length > 0
            ? category?.description ?? 'Этот раздел уже наполнен карточками из owner-CMS.'
            : 'Здесь пока стоят аккуратные заглушки. Дальше можно наполнить раздел карточками, фильтрами, картой, подборками и внутренними страницами.'
        }
        showBack
      />

      {categoryPlaces.length > 0 ? (
        <section className="grid-listing">
          {categoryPlaces.map((item) => (
            <PlaceholderCard
              key={item.id}
              title={item.title}
              address={item.address}
              description={item.description}
              rating={item.rating}
              imageLabel={item.imageLabel}
              imageSrc={item.imageSrc}
              imageSources={getPlaceImages(item)}
              phone={item.phone}
              website={item.website}
              hours={item.hours}
              top={item.top}
              meta={compactStrings([
                item.kind,
                item.cuisine,
                item.avgCheck ? `Средний чек ${item.avgCheck}` : undefined,
                ...item.services,
                ...item.tags
              ])}
            />
          ))}
        </section>
      ) : (
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
      )}
    </div>
  );
}
