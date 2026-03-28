import { Link } from 'react-router-dom';
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
    <section className="travel-hero" aria-label="Главный экран">
      <div className="travel-hero__media" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="travel-hero__overlay" />

      <div className="travel-hero__content">
        <div className="travel-hero__copy">
          <h1>
            <span>Discover</span>
            <strong>Da Nang</strong>
          </h1>
          <p>Your ultimate guide to the city</p>
        </div>

        <div className="travel-hero__logo-wrap">
          <AppLogo className="travel-hero__logo" alt={logoMedia?.alt || 'Danang Guide'} media={logoMedia} animated />
        </div>

        <Link className="travel-searchbar" to="/search" aria-label="Открыть поиск по местам">
          <span className="travel-searchbar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M10.75 4a6.75 6.75 0 1 0 4.19 12.05l3.5 3.5a1 1 0 1 0 1.41-1.41l-3.5-3.5A6.75 6.75 0 0 0 10.75 4Zm0 2a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="travel-searchbar__text">Search for places...</span>
          <span className="travel-searchbar__voice" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a1 1 0 0 1 2 0 7 7 0 0 1-6 6.93V21h2a1 1 0 1 1 0 2H9a1 1 0 0 1 0-2h2v-2.07A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 1 0 10 0Z" fill="currentColor"/>
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}
