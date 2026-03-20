import { Link } from 'react-router-dom';
import { useGuideContent } from '../../hooks/useGuideContent';

export function FeatureGrid() {
  const { home } = useGuideContent();

  return (
    <section className="home-showcase" aria-label="Главное меню">
      <div className="home-column home-column--popular">
        <div className="home-section-title">Популярное</div>
        <div className="poster-grid poster-grid--two">
          {home.popular.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              className={`poster-tile poster-tile--${feature.tone || 'coast'}`}
            >
              <span className="poster-tile__eyebrow">Подборка</span>
              <strong>{feature.title}</strong>
              <small>{feature.description}</small>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-column home-column--categories">
        <div className="home-section-title">Категории</div>
        <div className="tile-grid tile-grid--rich">
          {home.categories.map((tile) => (
            <Link key={tile.id} to={tile.path} className={`menu-tile menu-tile--${tile.tone || 'orange'}`}>
              {tile.badge ? <span className="menu-tile__badge">{tile.badge}</span> : <span className="menu-tile__badge menu-tile__badge--empty">&nbsp;</span>}
              <span className="menu-tile__label">{tile.title}</span>
              <span className="menu-tile__subtitle">{tile.subtitle}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-column home-column--tips">
        <div className="home-section-title">Советы</div>
        <div className="tips-list">
          {home.tips.map((tip, index) => (
            <Link key={tip.id} to={tip.path} className="tips-list__item">
              <span className="tips-list__index">0{index + 1}</span>
              <span>{tip.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
