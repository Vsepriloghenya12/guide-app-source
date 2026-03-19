import { NavLink } from 'react-router-dom';

const items = [
  { to: '/search', label: 'Поиск', icon: '⌕' },
  { to: '/favorites', label: 'Избранное', icon: '♡' },
  { to: '/nearby', label: 'Рядом', icon: '◎' },
  { to: '/help', label: 'Помощь', icon: '?' },
  { to: '/contacts', label: 'Контакты', icon: '✆' }
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Нижняя навигация">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
