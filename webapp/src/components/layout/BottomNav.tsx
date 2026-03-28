import { NavLink } from 'react-router-dom';
import { useSecretTheme } from '../../secretTheme/SecretThemeProvider';

type NavIconName = 'home' | 'search' | 'heart' | 'nearby' | 'contacts';

const items: Array<{ to: string; label: string; icon: NavIconName }> = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/favorites', label: 'Saved', icon: 'heart' },
  { to: '/nearby', label: 'Map', icon: 'nearby' },
  { to: '/contacts', label: 'Info', icon: 'contacts' }
];

const secretNavGlyphs: Record<NavIconName, string> = {
  home: '鬼',
  search: '目',
  heart: '縁',
  nearby: '道',
  contacts: '文'
};

function ClassicBottomNavIcon({ name }: { name: NavIconName }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="currentColor" d="M12 3.6 3.8 10.3c-.33.27-.41.75-.18 1.12.24.36.72.5 1.1.32L6 11.1V19c0 1.1.9 2 2 2h2.9c.5 0 .9-.4.9-.9v-4.2h.4V20c0 .5.4.9.9.9H16c1.1 0 2-.9 2-2v-7.9l1.28.67c.38.18.86.04 1.1-.32.23-.37.15-.85-.18-1.12L12 3.6Z"/>
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="currentColor" d="M10.4 4a6.4 6.4 0 1 0 3.95 11.43l3.5 3.5a1 1 0 0 0 1.42-1.41l-3.5-3.5A6.4 6.4 0 0 0 10.4 4Zm0 1.8a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Z"/>
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="currentColor" d="M12 20.8c-.17 0-.34-.04-.5-.13C8.16 18.85 4 15.77 4 10.97 4 8.2 6.18 6 8.83 6c1.42 0 2.72.62 3.57 1.67A4.72 4.72 0 0 1 15.97 6C18.8 6 21 8.24 21 10.97c0 4.8-4.45 7.88-8.48 9.7-.16.08-.34.12-.52.12Z"/>
        </svg>
      );
    case 'nearby':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="currentColor" d="M12 2.9A8.1 8.1 0 0 0 3.9 11c0 5.22 6.65 10.03 7.4 10.55.42.3.98.3 1.4 0 .76-.52 7.4-5.33 7.4-10.55A8.1 8.1 0 0 0 12 2.9Zm0 4.3a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Zm0 2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z"/>
        </svg>
      );
    case 'contacts':
      return (
        <svg viewBox="0 0 24 24" className="bottom-nav__icon-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="currentColor" d="M5.5 5A2.5 2.5 0 0 0 3 7.5v9A2.5 2.5 0 0 0 5.5 19h13a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 18.5 5h-13Zm.73 2h11.54c.14 0 .23.15.15.26l-5.15 4.5a1.2 1.2 0 0 1-1.58 0L6.08 7.26A.18.18 0 0 1 6.23 7Zm-.73 2.62 4.38 3.83a3 3 0 0 0 3.96 0l4.16-3.65v6.7a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V9.62Z"/>
        </svg>
      );
    default:
      return null;
  }
}

function SecretBottomNavIcon({ name }: { name: NavIconName }) {
  return <span className="bottom-nav__icon-kanji" aria-hidden="true">{secretNavGlyphs[name]}</span>;
}

function BottomNavIcon({ name }: { name: NavIconName }) {
  const { isActive } = useSecretTheme();
  return isActive ? <SecretBottomNavIcon name={name} /> : <ClassicBottomNavIcon name={name} />;
}

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Нижняя навигация">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`} end={item.to === '/'}>
          <BottomNavIcon name={item.icon} />
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
