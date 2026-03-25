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
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <path {...common} d="M4 10.5 12 4l8 6.5" />
          <path {...common} d="M6.5 9.8V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.8" />
          <path {...common} d="M10 20v-5h4v5" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <circle {...common} cx="11" cy="11" r="5.5" />
          <path {...common} d="m16 16 4 4" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <path {...common} d="M12 19.5c-4.6-2.7-7.5-5.6-7.5-9.1 0-2.3 1.8-4.1 4-4.1 1.5 0 2.8.8 3.5 2 0.7-1.2 2-2 3.5-2 2.2 0 4 1.8 4 4.1 0 3.5-2.9 6.4-7.5 9.1Z" />
        </svg>
      );
    case 'nearby':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <path {...common} d="M12 20.5s5-4.5 5-8.6A5 5 0 0 0 7 11.9c0 4.1 5 8.6 5 8.6Z" />
          <circle {...common} cx="12" cy="11" r="1.8" />
        </svg>
      );
    case 'contacts':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <path {...common} d="M7.8 6.2h8.4a2.2 2.2 0 0 1 2.2 2.2v7.2a2.2 2.2 0 0 1-2.2 2.2H7.8a2.2 2.2 0 0 1-2.2-2.2V8.4a2.2 2.2 0 0 1 2.2-2.2Z" />
          <path {...common} d="m7 9 5 4 5-4" />
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
          <span className="bottom-nav__icon" aria-hidden="true">
            <BottomNavIcon name={item.icon} />
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
