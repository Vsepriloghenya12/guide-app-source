import { AppLogo } from '../common/AppLogo';
import type { HomeBanner, HomeLogoMedia } from '../../types';

type HomeHeroProps = {
  banners: HomeBanner[];
  logoMedia?: HomeLogoMedia;
};

export function HomeHero({ banners, logoMedia }: HomeHeroProps) {
  const primaryBanner = banners[0];
  const heroImage = primaryBanner?.imageSrc || '/danang-clean-poster.png';

  return (
    <section className="travel-hero travel-hero--rebuild" aria-label="Главный экран">
      <div className="travel-hero__media" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="travel-hero__overlay" />

      <div className="travel-hero__content travel-hero__content--rebuild">
        <div className="travel-hero__headline">
          <span className="travel-hero__eyebrow">Городской гид</span>
          <h1>Дананг</h1>
          <p>Лучшие места, пляжи, маршруты и полезные советы в одном приложении.</p>
        </div>

        <div className="travel-hero__logo-wrap">
          <AppLogo className="travel-hero__logo travel-hero__logo--rebuild" alt={logoMedia?.alt || 'Danang Guide'} media={logoMedia} animated />
        </div>
      </div>
    </section>
  );
}
