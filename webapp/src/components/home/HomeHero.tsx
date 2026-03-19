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
          <span className="eyebrow">Danang city guide</span>
          <h1>Дананг. Места, вкус, маршруты и впечатления.</h1>
          <p>
            Фон и атмосфера экрана уже собраны в стиле яркого постера: море, мосты, город и
            ключевые точки для красивого и удобного guide-приложения.
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
