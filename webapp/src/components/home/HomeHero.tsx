import { AppLogo } from '../common/AppLogo';
import type { HomeBanner, HomeLogoMedia } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';

type HomeHeroProps = {
  banners: HomeBanner[];
  logoMedia?: HomeLogoMedia;
};

export function HomeHero({ banners, logoMedia }: HomeHeroProps) {
  return (
    <section className="hero hero--poster hero--compact">
      <div className="hero__brand hero__brand--center">
        <AppLogo className="hero__logo hero__logo--giant" alt={logoMedia?.alt || 'Логотип Guide'} media={logoMedia} />
      </div>

      {banners.length > 0 ? (
        <div className="home-banners">
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.linkPath}
              className={`home-banner home-banner--${banner.tone}`}
              style={banner.imageSrc ? { backgroundImage: `url(${banner.imageSrc})` } : undefined}
              onClick={() =>
                recordGuideAnalytics({
                  kind: 'banner-click',
                  label: banner.title,
                  path: banner.linkPath,
                  entityId: banner.id
                })
              }
            >
              <strong>{banner.title}</strong>
              <span>{banner.subtitle}</span>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
