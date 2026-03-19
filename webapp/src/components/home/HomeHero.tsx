import { Link } from 'react-router-dom';
import { AppLogo } from '../common/AppLogo';

export function HomeHero() {
  return (
    <section className="hero card">
      <div className="hero__brand">
        <AppLogo className="hero__logo" alt="Логотип Guide" />
        <div className="hero__copy">
          <span className="eyebrow">Danang city guide</span>
          <h1>Дананг. Места, вкус, маршруты и впечатления.</h1>
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
