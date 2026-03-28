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
    <section className="reference-hero" aria-label="Главный экран Guide">
      <div className="reference-hero__media" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="reference-hero__shade" />

      <div className="reference-hero__content">
        <div className="reference-hero__brand-row">
          <AppLogo className="reference-hero__logo" alt={logoMedia?.alt || 'Логотип Guide'} media={logoMedia} animated />
        </div>

        <div className="reference-hero__copy">
          <span className="reference-hero__eyebrow">Your ultimate guide to the city</span>
          <h1>
            <span>Discover</span>
            <strong>Da Nang</strong>
          </h1>
          <p>Места, пляжи, еда, маршруты и советы в одном понятном travel-приложении.</p>
        </div>

        <Link className="reference-searchbar" to="/search" aria-label="Открыть поиск по местам">
          <span className="reference-searchbar__icon" aria-hidden="true">
            ⌕
          </span>
          <span className="reference-searchbar__text">Search for places…</span>
          <span className="reference-searchbar__action" aria-hidden="true">
            ◉
          </span>
        </Link>
      </div>
    </section>
  );
}
