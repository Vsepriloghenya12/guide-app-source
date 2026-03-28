import type { HomeBanner, HomeLogoMedia } from '../../types';

type HomeHeroProps = {
  banners: HomeBanner[];
  logoMedia?: HomeLogoMedia;
};

export function HomeHero({ banners, logoMedia }: HomeHeroProps) {
  const heroImage = '/home-hero-background.png';
  const logoImage = '/home-hero-logo.png';
  const logoAlt = 'Городской гид Дананг';

  return (
    <section className="travel-hero travel-hero--clean" aria-label="Главный экран">
      <div className="travel-hero__media" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="travel-hero__overlay" />

      <div className="travel-hero__content travel-hero__content--logo-only">
        <img className="travel-hero__static-logo" src={logoImage} alt={logoAlt} loading="eager" decoding="async" />
      </div>
    </section>
  );
}
