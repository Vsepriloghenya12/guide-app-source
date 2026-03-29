import { Link } from 'react-router-dom';
import { recordGuideAnalytics } from '../../utils/analytics';
import type { HomeBanner, HomeLogoMedia } from '../../types';
import { AppLogo } from '../common/AppLogo';

type HomeHeroProps = {
  banners: HomeBanner[];
  logoMedia?: HomeLogoMedia;
};

export function HomeHero({ banners, logoMedia }: HomeHeroProps) {
  const primaryBanner = banners[0];
  const heroImage = primaryBanner?.imageSrc || '/home-hero-background.png';
  const logoAlt = 'Городской гид Дананг';
  const heroLogo = logoMedia?.src
    ? logoMedia
    : {
        type: 'image' as const,
        src: '/home-hero-logo.png',
        alt: logoAlt
      };
  const heroTitle = primaryBanner?.title || 'Лучшие места Дананга';
  const heroSubtitle =
    primaryBanner?.subtitle || 'Рестораны, маршруты, события и полезные места города в одном спокойном travel-приложении.';
  const heroPath = primaryBanner?.linkPath || '/search';
  const heroEyebrow = primaryBanner ? 'Подборка дня' : 'Городской гид';

  return (
    <section className="travel-hero travel-hero--clean" aria-label="Главный экран" data-tone={primaryBanner?.tone || 'coast'}>
      <div className="travel-hero__media" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="travel-hero__overlay" />

      <div className="travel-hero__content travel-hero__content--featured">
        <div className="travel-hero__panel">
          <span className="travel-hero__eyebrow">{heroEyebrow}</span>
          <AppLogo className="travel-hero__brand-logo" alt={heroLogo.alt || logoAlt} media={heroLogo} />

          <div className="travel-hero__copy travel-hero__copy--featured">
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
          </div>

          <div className="travel-hero__actions">
            <Link
              className="travel-primary-button travel-primary-button--hero"
              to={heroPath}
              onClick={() => {
                if (!primaryBanner) {
                  return;
                }

                recordGuideAnalytics({
                  kind: 'banner-click',
                  label: primaryBanner.title,
                  path: heroPath,
                  entityId: primaryBanner.id
                });
              }}
            >
              Открыть подборку
            </Link>
            <Link className="travel-secondary-button travel-secondary-button--hero" to="/search">
              Смотреть все
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
