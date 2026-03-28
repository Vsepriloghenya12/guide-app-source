import { AppLogo } from '../common/AppLogo';
import type { HomeBanner, HomeLogoMedia } from '../../types';

type HomeHeroProps = {
  banners: HomeBanner[];
  logoMedia?: HomeLogoMedia;
};

export function HomeHero({ banners, logoMedia }: HomeHeroProps) {
  const primaryBanner = banners[0];
  const heroImage = primaryBanner?.imageSrc || '/danang-home-poster.png';

  return (
    <section className="travel-hero" aria-label="Главный экран">
      <div className="travel-hero__media" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="travel-hero__overlay" />

      <div className="travel-hero__content">
        <div className="travel-hero__copy">
          <h1>
            <span>Открой</span>
            <strong>Дананг</strong>
          </h1>
          <p>Гид по лучшим местам, еде, пляжам и полезным маршрутам города.</p>
        </div>

        <div className="travel-hero__logo-wrap">
          <AppLogo className="travel-hero__logo" alt={logoMedia?.alt || 'Danang Guide'} media={logoMedia} animated />
        </div>
      </div>
    </section>
  );
}
