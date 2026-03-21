import { AppLogo } from '../common/AppLogo';
import type { HomeBanner } from '../../types';

type HomeHeroProps = {
  banners: HomeBanner[];
};

export function HomeHero({ banners }: HomeHeroProps) {
  return (
    <section className="hero hero--poster hero--compact">
      <div className="hero__brand hero__brand--center">
        <AppLogo className="hero__logo hero__logo--giant" alt="Логотип Guide" />
      </div>

      {banners.length > 0 ? (
        <div className="home-banners">
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.linkPath}
              className={`home-banner home-banner--${banner.tone}`}
              style={banner.imageSrc ? { backgroundImage: `url(${banner.imageSrc})` } : undefined}
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
