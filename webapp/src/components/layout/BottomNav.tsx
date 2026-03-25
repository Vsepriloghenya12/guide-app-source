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
    strokeWidth: 1.85,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <path {...common} d="M3.75 10.25 12 3.75l8.25 6.5" />
          <path {...common} d="M6.75 9.8V19a1.25 1.25 0 0 0 1.25 1.25h8A1.25 1.25 0 0 0 17.25 19V9.8" />
          <path {...common} d="M10 20.25V14.75h4v5.5" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <circle {...common} cx="10.5" cy="10.5" r="5.75" />
          <path {...common} d="m15.25 15.25 4.5 4.5" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <path {...common} d="M12 20c-4.95-2.85-8-6.15-8-10 0-2.65 2.05-4.75 4.6-4.75 1.65 0 3.05.8 3.9 2.05.85-1.25 2.25-2.05 3.9-2.05C18.95 5.25 21 7.35 21 10c0 3.85-3.05 7.15-9 10Z" />
        </svg>
      );
    case 'nearby':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <path {...common} d="M12 20s-5.25-3.95-5.25-8.45A5.25 5.25 0 0 1 17.25 11.55C17.25 16.05 12 20 12 20Z" />
          <circle {...common} cx="12" cy="11.25" r="1.75" />
        </svg>
      );
    case 'contacts':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg">
          <path {...common} d="M5.25 8.25A2.25 2.25 0 0 1 7.5 6h9a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 16.5 18h-9a2.25 2.25 0 0 1-2.25-2.25v-7.5Z" />
          <path {...common} d="m6.5 8.25 5.5 4.5 5.5-4.5" />
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
