import { Link } from 'react-router-dom';
import { homeFeatures } from '../../data/categories';
import { useGuideContent } from '../../hooks/useGuideContent';
import { CategoryIcon } from '../icons/CategoryIcon';

const categoryTiles = [
  { id: 'food', title: 'Еда', icon: 'food', path: '/restaurants', tone: 'orange' },
  { id: 'fun', title: 'Развлечения', icon: 'fun', path: '/section/events', tone: 'blue' },
  { id: 'culture', title: 'Культура', icon: 'culture', path: '/section/culture', tone: 'pink' },
  { id: 'spa', title: 'СПА', icon: 'spa', path: '/wellness', tone: 'green' },
  { id: 'shopping', title: 'Шопинг', icon: 'shopping', path: '/section/shops', tone: 'red' },
  { id: 'nature', title: 'Природа', icon: 'nature', path: '/section/routes', tone: 'teal' }
] as const;

const posterTones = ['coast', 'bridge'] as const;

export function FeatureGrid() {
  const { featured, tips } = useGuideContent();
  const popularCards = featured.length > 0 ? featured : homeFeatures.slice(0, 2).map((item) => ({
    id: item.id,
    title: item.title,
    path: item.path,
    imageUrl: '',
    imageLabel: item.title,
    category: 'restaurants' as const
  }));

  const homeTips = tips.length > 0
    ? tips
    : [
        { id: 'tip-1', title: 'Топ 10 мест Дананга', path: '/section/culture' },
        { id: 'tip-2', title: 'Где купить сувениры', path: '/section/shops' },
        { id: 'tip-3', title: 'Лучшие кафе города', path: '/restaurants' }
      ];

  return (
    <section className="home-showcase" aria-label="Главное меню">
      <div className="home-column home-column--popular">
        <div className="home-section-title">Популярное</div>
        <div className="poster-grid poster-grid--two">
          {popularCards.slice(0, 2).map((feature, index) => (
            <Link
              key={feature.id}
              to={feature.path}
              className={`poster-tile poster-tile--${posterTones[index] ?? 'coast'}`}
              style={feature.imageUrl ? { backgroundImage: `url(${feature.imageUrl})` } : undefined}
            >
              <strong>{feature.title}</strong>
              {feature.imageUrl ? <span className="poster-tile__caption">{feature.imageLabel}</span> : null}
            </Link>
          ))}
        </div>
      </div>

      <div className="home-column home-column--categories">
        <div className="home-section-title">Категории</div>
        <div className="tile-grid">
          {categoryTiles.map((tile) => (
            <Link key={tile.id} to={tile.path} className={`menu-tile menu-tile--${tile.tone}`}>
              <span className="menu-tile__icon menu-tile__icon--svg" aria-hidden="true">
                <CategoryIcon type={tile.icon} />
              </span>
              <span className="menu-tile__label">{tile.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-column home-column--tips">
        <div className="home-section-title">Советы</div>
        <div className="tips-list">
          {homeTips.map((tip) => (
            <Link key={tip.id} to={tip.path} className="tips-list__item">
              <span>{tip.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
