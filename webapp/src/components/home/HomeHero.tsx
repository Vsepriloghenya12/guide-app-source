import { Link } from 'react-router-dom';
import { AppLogo } from '../common/AppLogo';

export function HomeHero() {
  return (
    <section className="hero hero--poster">
      <div className="hero__brand hero__brand--center">
        <AppLogo className="hero__logo hero__logo--giant" alt="Логотип Guide" />

        <div className="hero__copy hero__copy--center">
          <span className="eyebrow">Da Nang · Vietnam</span>
          <p>Пляжи, город, вкусные места, маршруты и полезные точки в одном приложении.</p>
        </div>

        <div className="hero__quicklinks" aria-label="Быстрые переходы">
          <Link className="hero__quicklink" to="/restaurants">
            Еда
          </Link>
          <Link className="hero__quicklink" to="/wellness">
            СПА
          </Link>
          <Link className="hero__quicklink" to="/section/culture">
            Места
          </Link>
          <Link className="hero__quicklink" to="/owner">
            Владелец
          </Link>
        </div>
      </div>
    </section>
  );
}
