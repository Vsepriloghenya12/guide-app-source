import { useState } from 'react';
import { Link } from 'react-router-dom';
import { stayPrograms } from '../../data/programs';
import type { GuideCategory, GuidePlace, GuideTip, HomeSectionTitles } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';
import { getCategoryListImage, getCategoryTone, getPlaceTone, getQuickMenuImage } from './homeVisuals';

type FeatureGridProps = {
  popularPlaces: GuidePlace[];
  featuredCategories: GuideCategory[];
  allCategories: GuideCategory[];
  tips: GuideTip[];
  sectionTitles: HomeSectionTitles;
};

function getPlacePath(place: GuidePlace) {
  return `/place/${place.slug || `${place.categoryId}-${place.id}`}`;
}

export function FeatureGrid({
  popularPlaces,
  featuredCategories,
  allCategories,
  tips,
  sectionTitles
}: FeatureGridProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const quickCategories = featuredCategories.slice(0, 4);
  const visibleTips = tips.slice(0, 5);
  const programDurations = stayPrograms.slice(0, 3);

  return (
    <section className="travel-home-sections">
      {quickCategories.length > 0 ? (
        <section className="travel-section travel-section--quick travel-section--quick-home" aria-label="Быстрые рубрики">
          <div className="travel-section__header travel-section__header--home travel-section__header--home-categories">
            <span className="travel-section__toggle-spacer" aria-hidden="true" />
            <h2>{sectionTitles.categories || 'Категории'}</h2>
            <button
              type="button"
              className={`travel-section__toggle${showAllCategories ? ' is-active' : ''}`}
              aria-expanded={showAllCategories}
              aria-controls="home-categories-expanded"
              onClick={() => setShowAllCategories((value) => !value)}
            >
              {showAllCategories ? 'Скрыть' : 'Все'}
            </button>
          </div>

          <div className="travel-quick-grid travel-quick-grid--four">
            {quickCategories.map((category, index) => (
              <Link
                key={category.id}
                to={category.path}
                className="travel-quick-photo"
                data-tone={getCategoryTone(category)}
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
                <span className="travel-quick-photo__disc" aria-hidden="true">
                  <img src={getQuickMenuImage(category, index)} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="travel-quick-photo__body">
                  {category.badge ? <span className="travel-quick-photo__meta">{category.badge}</span> : null}
                  <span className="travel-quick-photo__label">{category.shortTitle || category.title}</span>
                </span>
                <span className="travel-quick-photo__arrow" aria-hidden="true">›</span>
              </Link>
            ))}
          </div>

          <div
            className={`travel-categories-expand${showAllCategories ? ' is-open' : ''}`}
            id="home-categories-expanded"
            aria-hidden={!showAllCategories}
          >
            <div className="travel-categories-expand__inner">
              <div className="travel-directory-list travel-directory-list--stripes" role="list">
                {allCategories.map((category, index) => (
                  <Link
                    key={category.id}
                    to={category.path}
                    className="travel-directory-row"
                    data-tone={getCategoryTone(category)}
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
                    <span className="travel-directory-row__body">
                      {category.badge ? <span className="travel-directory-row__eyebrow">{category.badge}</span> : null}
                      <span className="travel-directory-row__title">{category.shortTitle || category.title}</span>
                      {category.description ? <span className="travel-directory-row__text">{category.description}</span> : null}
                    </span>
                    <span className="travel-directory-row__media" aria-hidden="true">
                      <img src={getCategoryListImage(category, index)} alt="" loading="lazy" decoding="async" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="travel-section travel-section--programs-home" aria-label="Готовые программы">
        <Link to="/programs" className="travel-programs-spotlight" data-tone="bridge">
          <span className="travel-programs-spotlight__eyebrow">Готовые программы</span>
          <strong>Подбери сценарий отдыха по сроку поездки</strong>
          <p>
            Открой готовые варианты для короткого отпуска, недели у моря и более длинного отдыха,
            не собирая маршрут вручную.
          </p>

          <span className="travel-programs-spotlight__chips" aria-label="Длительности поездки">
            {programDurations.map((program) => (
              <span key={program.id} className="travel-programs-spotlight__chip">
                {program.stayLabel}
              </span>
            ))}
          </span>

          <span className="travel-programs-spotlight__action">
            Открыть программы <span aria-hidden="true">›</span>
          </span>
        </Link>
      </section>
      {popularPlaces.length > 0 ? (
        <section className="travel-section travel-section--popular-home">
          <div className="travel-section__header travel-section__header--home">
            <h2>{sectionTitles.popular || 'Топ'}</h2>
            <Link to="/search">Смотреть все</Link>
          </div>

          <div className="travel-picks-row">
            {popularPlaces.slice(0, 3).map((place) => {
              const imageSrc = place.imageGallery?.[0] || place.imageSrc || '/home-hero-background.png';
              const detailPath = getPlacePath(place);
              const badgeLabel = place.listingType || place.kind || place.cuisine || 'Место';
              const metaLabel = place.district || place.priceLabel || place.hours || place.shortDescription || '';
              return (
                <Link
                  key={place.id}
                  to={detailPath}
                  className="travel-pick-card"
                  data-tone={getPlaceTone(place.categoryId)}
                  style={{ backgroundImage: `url(${imageSrc})` }}
                  onClick={() =>
                    recordGuideAnalytics({
                      kind: 'place-click',
                      label: place.title,
                      path: detailPath,
                      entityId: place.id,
                      categoryId: place.categoryId
                    })
                  }
                >
                  <span className="travel-pick-card__shade" />
                  {place.rating ? <span className="travel-pick-card__rating">{place.rating.toFixed(1)} ★</span> : null}
                  <span className="travel-pick-card__content">
                    <span className="travel-pick-card__eyebrow">{badgeLabel}</span>
                    <strong>{place.title}</strong>
                    {metaLabel ? <span>{metaLabel}</span> : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {visibleTips.length > 0 ? (
        <section className="travel-section travel-section--stories-home">
          <div className="travel-section__header travel-section__header--home">
            <h2>{sectionTitles.tips || 'Советы'}</h2>
            <Link to="/help">Открыть</Link>
          </div>

          <div className="travel-story-list travel-story-list--plain">
            {visibleTips.map((item) => (
              <Link
                key={item.id}
                to={item.linkPath}
                className="travel-story-row"
                data-tone="emerald"
                onClick={() =>
                  recordGuideAnalytics({
                    kind: 'tip-click',
                    label: item.title,
                    path: item.linkPath,
                    entityId: item.id
                  })
                }
              >
                <span
                  className="travel-story-row__thumb"
                  style={{ backgroundImage: 'url(/home-hero-background.png)' }}
                  aria-hidden="true"
                />
                <span className="travel-story-row__body">
                  <span className="travel-story-row__eyebrow">Совет</span>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </span>
                <span className="travel-story-row__arrow" aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
