import { useRef, useState, type TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { stayPrograms } from '../../data/programs';
import type { GuideCategory, GuideTip, HomeBanner, HomeSectionTitles } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';
import { getCategoryTone, getQuickMenuImage } from './homeVisuals';

type FeatureGridProps = {
  featuredCategories: GuideCategory[];
  allCategories: GuideCategory[];
  banners: HomeBanner[];
  tips: GuideTip[];
  sectionTitles: HomeSectionTitles;
};

export function FeatureGrid({
  featuredCategories: _featuredCategories,
  allCategories,
  banners,
  tips,
  sectionTitles
}: FeatureGridProps) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [bannerMotion, setBannerMotion] = useState<'next' | 'prev'>('next');
  const bannerTouchStartX = useRef<number | null>(null);
  const blockBannerClick = useRef(false);
  const visibleTips = tips.slice(0, 5);
  const programDurations = stayPrograms.slice(0, 3);
  const activeBanner = banners.length > 0 ? banners[((activeBannerIndex % banners.length) + banners.length) % banners.length] : null;

  const moveBanner = (direction: 'prev' | 'next') => {
    if (banners.length < 2) return;

    setBannerMotion(direction === 'next' ? 'next' : 'prev');
    setActiveBannerIndex((current) => {
      if (direction === 'next') {
        return (current + 1) % banners.length;
      }

      return (current - 1 + banners.length) % banners.length;
    });
  };

  const handleBannerTouchStart = (event: TouchEvent<HTMLElement>) => {
    bannerTouchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleBannerTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (bannerTouchStartX.current === null) return;

    const deltaX = (event.changedTouches[0]?.clientX ?? 0) - bannerTouchStartX.current;
    bannerTouchStartX.current = null;

    if (Math.abs(deltaX) < 36) return;

    blockBannerClick.current = true;
    moveBanner(deltaX < 0 ? 'next' : 'prev');
    window.setTimeout(() => {
      blockBannerClick.current = false;
    }, 180);
  };

  return (
    <section className="travel-home-sections">
      {activeBanner ? (
        <section className="travel-section travel-section--home-banners" aria-label="Баннеры">
          <div className="travel-home-banner-carousel">
            <Link
              key={activeBanner.id}
              to={activeBanner.linkPath}
              className={`travel-home-banner-card travel-home-banner-card--${bannerMotion}`}
              data-tone={activeBanner.tone}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(9, 19, 38, 0.16) 0%, rgba(9, 19, 38, 0.72) 100%), url(${activeBanner.imageSrc || '/home-hero-background.png'})`
              }}
              onTouchStart={handleBannerTouchStart}
              onTouchEnd={handleBannerTouchEnd}
              onClick={(event) => {
                if (blockBannerClick.current) {
                  event.preventDefault();
                  return;
                }

                recordGuideAnalytics({
                  kind: 'banner-click',
                  label: activeBanner.title,
                  path: activeBanner.linkPath,
                  entityId: activeBanner.id
                });
              }}
            >
              <span className="travel-home-banner-card__eyebrow">Баннер</span>
              <strong>{activeBanner.title}</strong>
              <span>{activeBanner.subtitle}</span>
            </Link>

            {banners.length > 1 ? (
              <div className="travel-home-banner-dots" aria-label="Навигация по баннерам">
                {banners.map((banner, index) => (
                  <button
                    key={banner.id}
                    type="button"
                    className={`travel-home-banner-dot${index === activeBannerIndex ? ' is-active' : ''}`}
                    aria-label={`Открыть баннер ${index + 1}`}
                    onClick={() => {
                      if (index === activeBannerIndex) return;
                      setBannerMotion(index > activeBannerIndex ? 'next' : 'prev');
                      setActiveBannerIndex(index);
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

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
                className="travel-story-row travel-story-row--no-arrow"
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
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
