import { Link } from 'react-router-dom';

export function HomeHero() {
  return (
    <section className="hero card">
      <div className="hero__brand">
        <div className="hero__logo-wrap">
          <img
            className="hero__logo"
            src="/logo.svg"
            alt="Логотип Guide"
            onError={(event) => {
              event.currentTarget.src = '/logo-placeholder.svg';
            }}
          />
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
