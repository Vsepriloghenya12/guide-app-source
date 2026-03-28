import type { HomeBanner } from '../../types';

type HomeHeroProps = {
  banners: HomeBanner[];
};

export function HomeHero({ banners }: HomeHeroProps) {
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
          <p>Ваш главный гид по городу</p>
        </div>
      </div>
    </section>
  );
}
