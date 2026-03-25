import type { CSSProperties } from 'react';
import type { GuideCategoryId } from '../../types';

type CategoryIconProps = {
  categoryId: GuideCategoryId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
};

type Palette = {
  primary: string;
  secondary: string;
};

const paletteMap: Record<GuideCategoryId, Palette> = {
  restaurants: { primary: '#e9d4b2', secondary: '#b68758' },
  wellness: { primary: '#d8efe7', secondary: '#68b6a2' },
  'active-rest': { primary: '#e4efcf', secondary: '#94be5e' },
  routes: { primary: '#d9e8ff', secondary: '#78a1e8' },
  hotels: { primary: '#e5e8ff', secondary: '#8e97d8' },
  events: { primary: '#f5dceb', secondary: '#ca7fa5' },
  transport: { primary: '#dbecf8', secondary: '#7aa8c5' },
  atm: { primary: '#f5e7c1', secondary: '#d2a85c' },
  shops: { primary: '#f7ddd3', secondary: '#d58c72' },
  culture: { primary: '#e8dff6', secondary: '#9a81ca' },
  kids: { primary: '#fbebcf', secondary: '#d6a26c' },
  medicine: { primary: '#d9efe9', secondary: '#5eb5a1' },
  'photo-spots': { primary: '#dcecff', secondary: '#6fa1db' },
  'car-rental': { primary: '#dde5f7', secondary: '#7e95c4' }
};

function IconShape({ categoryId }: { categoryId: GuideCategoryId }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  switch (categoryId) {
    case 'restaurants':
      return (
        <>
          <path {...common} d="M11 8v7" />
          <path {...common} d="M14 8v7" />
          <path {...common} d="M17 8v7" />
          <path {...common} d="M14 15v9" />
          <path {...common} d="M24 8v16" />
          <path {...common} d="M24 8c3 1 5 3.8 5 7v0" />
        </>
      );
    case 'wellness':
      return (
        <>
          <path {...common} d="M20 25c4.5-2.2 7-6.7 7.5-12-3.2.2-5.9 1.8-7.5 4.4-1.6-2.6-4.3-4.2-7.5-4.4.5 5.3 3 9.8 7.5 12Z" />
          <path {...common} d="M20 15c-2.8-1.3-4.6-3.8-5.5-7 2.5.3 4.6 1.6 5.5 3.9 1-2.3 3.1-3.6 5.5-3.9-.9 3.2-2.7 5.7-5.5 7Z" />
        </>
      );
    case 'active-rest':
      return (
        <>
          <circle cx="24.5" cy="8.5" r="1.9" fill="currentColor" stroke="none" />
          <path {...common} d="M9 24l6-8 4 3 4.5-6L31 24" />
          <path {...common} d="M15 16l3-4 4 1" />
        </>
      );
    case 'routes':
      return (
        <>
          <circle cx="11" cy="11" r="2.3" {...common} />
          <circle cx="29" cy="24" r="2.3" {...common} />
          <path {...common} d="M13 11c5 0 7 2 7 5s-2 5-7 5" />
          <path {...common} d="M20 21c1.8 1.8 4.2 3 6.7 3" />
        </>
      );
    case 'hotels':
      return (
        <>
          <path {...common} d="M10 24V10.5c0-.8.7-1.5 1.5-1.5h10c.8 0 1.5.7 1.5 1.5V24" />
          <path {...common} d="M23 14h6a1.5 1.5 0 0 1 1.5 1.5V24" />
          <path {...common} d="M14 13h4" />
          <path {...common} d="M14 17h4" />
          <path {...common} d="M15 24v-4h3v4" />
        </>
      );
    case 'events':
      return (
        <>
          <rect x="9" y="11" width="22" height="14" rx="3" {...common} />
          <path {...common} d="M14 8v5" />
          <path {...common} d="M26 8v5" />
          <path {...common} d="M9 16h22" />
          <path {...common} d="M16 20h8" />
        </>
      );
    case 'transport':
      return (
        <>
          <path {...common} d="M10 20v-5c0-3.1 2.4-5.5 5.5-5.5h9c3.1 0 5.5 2.4 5.5 5.5v5" />
          <path {...common} d="M10 20h20" />
          <circle cx="15" cy="23" r="1.8" fill="currentColor" stroke="none" />
          <circle cx="25" cy="23" r="1.8" fill="currentColor" stroke="none" />
        </>
      );
    case 'atm':
      return (
        <>
          <rect x="9" y="10" width="22" height="14" rx="3" {...common} />
          <path {...common} d="M13 15h8" />
          <path {...common} d="M13 19h5" />
          <path {...common} d="M24 14v6" />
          <path {...common} d="M27 17h-6" />
        </>
      );
    case 'shops':
      return (
        <>
          <path {...common} d="M11 13h18l-1.2 11H12.2L11 13Z" />
          <path {...common} d="M15 13V11a5 5 0 0 1 10 0v2" />
        </>
      );
    case 'culture':
      return (
        <>
          <path {...common} d="M10 13h20" />
          <path {...common} d="M13 13v10" />
          <path {...common} d="M20 13v10" />
          <path {...common} d="M27 13v10" />
          <path {...common} d="M9 23h22" />
          <path {...common} d="M10 13l10-4 10 4" />
        </>
      );
    case 'kids':
      return (
        <>
          <path {...common} d="M20 10l8 5-8 5-8-5 8-5Z" />
          <path {...common} d="M20 20v5" />
          <path {...common} d="M28 15v5" />
        </>
      );
    case 'medicine':
      return (
        <>
          <path {...common} d="M20 9v16" />
          <path {...common} d="M12 17h16" />
          <rect x="10" y="9" width="20" height="16" rx="4" {...common} />
        </>
      );
    case 'photo-spots':
      return (
        <>
          <rect x="9" y="11" width="22" height="14" rx="3" {...common} />
          <circle cx="20" cy="18" r="4" {...common} />
          <path {...common} d="M14 11l2-2h8l2 2" />
        </>
      );
    case 'car-rental':
      return (
        <>
          <path {...common} d="M11 20l2-5.5c.4-1.2 1.5-2 2.8-2h8.4c1.3 0 2.4.8 2.8 2l2 5.5" />
          <path {...common} d="M10 20h20" />
          <circle cx="15" cy="23" r="1.8" fill="currentColor" stroke="none" />
          <circle cx="25" cy="23" r="1.8" fill="currentColor" stroke="none" />
        </>
      );
    default:
      return <circle cx="20" cy="18" r="6" {...common} />;
  }
}

export function CategoryIcon({ categoryId, size = 'md', className = '', title }: CategoryIconProps) {
  const palette = paletteMap[categoryId];
  const style = {
    ['--icon-primary' as string]: palette.primary,
    ['--icon-secondary' as string]: palette.secondary
  } as CSSProperties;

  return (
    <span
      className={`category-icon category-icon--${size} ${className}`.trim()}
      style={style}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      aria-label={title}
    >
      <svg viewBox="0 0 40 32" className="category-icon__svg" xmlns="http://www.w3.org/2000/svg">
        <g style={{ color: 'var(--icon-primary)' }}>
          <IconShape categoryId={categoryId} />
        </g>
      </svg>
    </span>
  );
}
