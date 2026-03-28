import { Link } from 'react-router-dom';
import { AppLogo } from '../common/AppLogo';
import type { HomeBanner, HomeLogoMedia } from '../../types';

type HomeHeroProps = {
  banners: HomeBanner[];
  logoMedia?: HomeLogoMedia;
};

export function HomeHero({ banners, logoMedia }: HomeHeroProps) {
  const primaryBanner = banners[0];
  const secondaryBanner = banners[1];
  const heroImage = primaryBanner?.imageSrc || '/danang-clean-poster.png';

  return (
    <section className="travel-hero" aria-label="Главный экран Guide" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="travel-hero__overlay" />
      <div className="travel-hero__inner">
        <div className="travel-hero__brandline">
          <AppLogo className="travel-hero__logo" alt={logoMedia?.alt || 'Логотип Guide'} media={logoMedia} animated />
        </div>

        <div className="travel-hero__copy">
          <span className="travel-hero__eyebrow">Danang Guide</span>
          <h1>Открой Дананг</h1>
          <p>Пляжи, еда, маршруты, советы и полезные места в одном приложении.</p>
        </div>

        <Link className="travel-searchbar" to="/search" aria-label="Открыть поиск по местам">
          <span className="travel-searchbar__icon" aria-hidden="true">⌕</span>
          <span className="travel-searchbar__text">Искать места, еду, пляжи и советы…</span>
          <span className="travel-searchbar__voice" aria-hidden="true">◉</span>
        </Link>

        <div className="travel-hero__actions">
          <Link className="travel-pill travel-pill--solid" to="/search">
            {primaryBanner?.title || 'Топ мест'}
          </Link>
          <Link className="travel-pill" to={secondaryBanner?.linkPath || '/nearby'}>
            {secondaryBanner?.title || 'Рядом со мной'}
          </Link>
        </div>
      </div>
    </section>
  );
}
