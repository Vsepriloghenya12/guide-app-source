import { Link } from 'react-router-dom';
import { homeFeatures } from '../../data/categories';

const categoryTiles = [
  { id: 'food', title: 'Еда', icon: '🍴', path: '/restaurants', tone: 'orange' },
  { id: 'fun', title: 'Развлечения', icon: '🍸', path: '/section/events', tone: 'blue' },
  { id: 'culture', title: 'Культура', icon: '⌂', path: '/section/culture', tone: 'pink' },
  { id: 'spa', title: 'СПА', icon: '✦', path: '/wellness', tone: 'green' },
  { id: 'shopping', title: 'Шопинг', icon: '🛍', path: '/section/shops', tone: 'red' },
  { id: 'nature', title: 'Природа', icon: '▲', path: '/section/routes', tone: 'teal' }
];

const tips = [
  { id: 'tip-1', title: 'Топ 10 мест Дананга', path: '/section/culture' },
  { id: 'tip-2', title: 'Где купить сувениры', path: '/section/shops' },
  { id: 'tip-3', title: 'Лучшие кафе города', path: '/restaurants' }
];

const popularCards = homeFeatures.slice(0, 2);
const posterTones = ['coast', 'bridge'] as const;

export function FeatureGrid() {
  return (
    <section className="home-showcase" aria-label="Главное меню">
      <div className="home-column home-column--popular">
        <div className="home-section-title">Популярное</div>
        <div className="poster-grid poster-grid--two">
          {popularCards.map((feature, index) => (
            <Link
              key={feature.id}
              to={feature.path}
              className={`poster-tile poster-tile--${posterTones[index] ?? 'coast'}`}
            >
              <strong>{feature.title}</strong>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-column home-column--categories">
        <div className="home-section-title">Категории</div>
        <div className="tile-grid">
          {categoryTiles.map((tile) => (
            <Link key={tile.id} to={tile.path} className={`menu-tile menu-tile--${tile.tone}`}>
              <span className="menu-tile__icon" aria-hidden="true">
                {tile.icon}
              </span>
              <span className="menu-tile__label">{tile.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-column home-column--tips">
        <div className="home-section-title">Советы</div>
        <div className="tips-list">
          {tips.map((tip) => (
            <Link key={tip.id} to={tip.path} className="tips-list__item">
              <span>{tip.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
