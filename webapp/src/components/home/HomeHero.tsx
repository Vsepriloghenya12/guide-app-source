import { Link } from 'react-router-dom';
import { AppLogo } from '../common/AppLogo';

export function HomeHero() {
  return (
    <section className="hero card">
      <div className="hero__brand">
        <div className="hero__logo-wrap">
          <AppLogo className="hero__logo" alt="Логотип Guide" />
        </div>
        <div className="hero__copy">
          <span className="eyebrow">Guide app</span>
          <h1>Ваш красивый гид по местам, отдыху и маршрутам</h1>
          <p>
            Стартовый экран уже готов под развитие: категории, подборки, карточки мест и отдельная
            зона владельца.
          </p>
        </div>
      </div>

      <div className="hero__actions">
        <Link className="button button--primary" to="/restaurants">
          Открыть подборки
        </Link>
        <Link className="button button--ghost" to="/owner">
          Страница владельца
        </Link>
      </div>
    </section>
  );
}
