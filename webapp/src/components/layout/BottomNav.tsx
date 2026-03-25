import { NavLink } from 'react-router-dom';

type NavIconName = 'home' | 'search' | 'heart' | 'nearby' | 'contacts';

const items: Array<{ to: string; label: string; icon: NavIconName }> = [
  { to: '/', label: 'Главная', icon: 'home' },
  { to: '/search', label: 'Поиск', icon: 'search' },
  { to: '/favorites', label: 'Избранное', icon: 'heart' },
  { to: '/nearby', label: 'Рядом', icon: 'nearby' },
  { to: '/contacts', label: 'Контакты', icon: 'contacts' }
];

function BottomNavIcon({ name }: { name: NavIconName }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path {...common} d="M4.5 10.5 12 4l7.5 6.5" />
          <path {...common} d="M7.25 9.75V19a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V9.75" />
          <path {...common} d="M10 20v-5h4v5" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle {...common} cx="11" cy="11" r="5.75" />
          <path {...common} d="m19 19-3.8-3.8" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path {...common} d="M12 20.25s-7-4.1-7-9.15A4.35 4.35 0 0 1 9.4 6.75c1.16 0 2.2.5 2.9 1.32a3.8 3.8 0 0 1 2.9-1.32A4.35 4.35 0 0 1 19.6 11.1c0 5.05-7.6 9.15-7.6 9.15Z" />
        </svg>
      );
    case 'nearby':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path {...common} d="M12 20s5-4.15 5-8.3a5 5 0 1 0-10 0C7 15.85 12 20 12 20Z" />
          <circle {...common} cx="12" cy="11.5" r="1.7" />
        </svg>
      );
    case 'contacts':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path {...common} d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
          <path {...common} d="m6.5 8 5.5 4.4L17.5 8" />
        </svg>
      );
    default:
      return null;
  }
}

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Нижняя навигация">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}
          end={item.to === '/'}
        >
          <span className="bottom-nav__inner">
            <span className="bottom-nav__icon" aria-hidden="true">
              <BottomNavIcon name={item.icon} />
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
