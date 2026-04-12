import { Link } from 'react-router-dom';
import { stayPrograms } from '../../data/programs';
import type { GuideCategory, GuideTip, HomeSectionTitles } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';
import { getCategoryTone, getQuickMenuImage } from './homeVisuals';

type FeatureGridProps = {
  featuredCategories: GuideCategory[];
  allCategories: GuideCategory[];
  tips: GuideTip[];
  sectionTitles: HomeSectionTitles;
};

export function FeatureGrid({
  featuredCategories: _featuredCategories,
  allCategories,
  tips,
  sectionTitles
}: FeatureGridProps) {
  const visibleTips = tips.slice(0, 5);
  const programDurations = stayPrograms.slice(0, 3);

  return (
    <section className="travel-home-sections">
      {allCategories.length > 0 ? (
        <section className="travel-section travel-section--quick travel-section--quick-home" aria-label="Быстрые рубрики">
          <div className="travel-section__header travel-section__header--home travel-section__header--home-categories">
            <h2>{sectionTitles.categories || 'Категории'}</h2>
          </div>

          <div className="travel-quick-grid travel-quick-grid--four travel-quick-grid--home-icons">
            {allCategories.map((category, index) => (
              <Link
                key={category.id}
                to={category.path}
                className="travel-quick-photo travel-quick-photo--icon-only"
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
                <span className="travel-quick-photo__label">{category.shortTitle || category.title}</span>
              </Link>
            ))}
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
