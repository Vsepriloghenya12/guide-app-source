import type { CSSProperties } from 'react';
import type { GuideCategoryId } from '../../types';

type CategoryIconProps = {
  categoryId: GuideCategoryId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
};

type Palette = {
  start: string;
  end: string;
  glow: string;
};

const paletteMap: Record<GuideCategoryId, Palette> = {
  restaurants: { start: '#ffb347', end: '#ff6a3d', glow: 'rgba(255, 197, 114, 0.46)' },
  wellness: { start: '#4fd6c2', end: '#0d9ca0', glow: 'rgba(79, 214, 194, 0.4)' },
  'active-rest': { start: '#a4dd59', end: '#2e8c44', glow: 'rgba(164, 221, 89, 0.34)' },
  routes: { start: '#59b8ff', end: '#2d6fe5', glow: 'rgba(89, 184, 255, 0.35)' },
  hotels: { start: '#8699ff', end: '#4956d3', glow: 'rgba(134, 153, 255, 0.32)' },
  events: { start: '#ff88b6', end: '#d1467f', glow: 'rgba(255, 136, 182, 0.34)' },
  transport: { start: '#71c8ff', end: '#1f7cc8', glow: 'rgba(113, 200, 255, 0.33)' },
  atm: { start: '#ffd25c', end: '#f19221', glow: 'rgba(255, 210, 92, 0.34)' },
  shops: { start: '#ff9d78', end: '#de5c4f', glow: 'rgba(255, 157, 120, 0.34)' },
  culture: { start: '#c8a3ff', end: '#6d4dd9', glow: 'rgba(200, 163, 255, 0.34)' },
  kids: { start: '#ffd96f', end: '#ff8d4e', glow: 'rgba(255, 217, 111, 0.34)' },
  medicine: { start: '#66e2cf', end: '#169b84', glow: 'rgba(102, 226, 207, 0.34)' },
  'photo-spots': { start: '#8fd1ff', end: '#397fd9', glow: 'rgba(143, 209, 255, 0.34)' },
  'car-rental': { start: '#7fb0ff', end: '#3f58d6', glow: 'rgba(127, 176, 255, 0.34)' }
};

function IconShape({ categoryId }: { categoryId: GuideCategoryId }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  switch (categoryId) {
    case 'restaurants':
      return (
        <>
          <path {...common} d="M19 12v8" />
          <path {...common} d="M15.5 8.5v5.5c0 1.1.9 2 2 2h3" />
          <path {...common} d="M22.5 8.5v5.5c0 1.1-.9 2-2 2" />
          <path {...common} d="M10 8.5v13" />
          <path {...common} d="M7.5 8.5v5" />
          <path {...common} d="M10 8.5v5" />
          <path {...common} d="M12.5 8.5v5" />
        </>
      );
    case 'wellness':
      return (
        <>
          <path {...common} d="M16 22c2.9-1.4 4.9-3.9 5.8-7-2.5.2-4.7 1.5-5.8 3.6-1.1-2.1-3.3-3.4-5.8-3.6.9 3.1 2.9 5.6 5.8 7Z" />
          <path {...common} d="M16 18c-2.6-1-4.3-3.1-5-6 2 .1 3.9 1 5 2.7 1.1-1.7 3-2.6 5-2.7-.7 2.9-2.4 5-5 6Z" />
          <path {...common} d="M16 9.5c1.1-1.8 3-2.8 5-3-1 2.7-2.8 4.7-5 5.6-2.2-.9-4-2.9-5-5.6 2 .2 3.9 1.2 5 3Z" />
        </>
      );
    case 'active-rest':
      return (
        <>
          <circle cx="24" cy="11" r="2.4" fill="currentColor" />
          <path {...common} d="M8 24l7.3-10.2 4.1 5.1 3.7-4.6L32 24" />
          <path {...common} d="M14 24l4.6-6.2 2.7 3.2" />
        </>
      );
    case 'routes':
      return (
        <>
          <path {...common} d="M11 25c0-2.8 2-4.3 4.5-5 3.3-1 5-2 5-4.5 0-2.1-1.7-3.7-3.8-3.7-2.8 0-4.1 1.8-4.8 4.2" />
          <path {...common} d="M24.6 22.5c1.8 0 3.4-1.5 3.4-3.4 0-1.8-1.6-3.4-3.4-3.4-1.8 0-3.4 1.6-3.4 3.4 0 1.9 1.6 3.4 3.4 3.4Z" />
          <path {...common} d="M11.2 14.7c1.2 0 2.2-1 2.2-2.2s-1-2.2-2.2-2.2S9 11.3 9 12.5s1 2.2 2.2 2.2Z" />
        </>
      );
    case 'hotels':
      return (
        <>
          <path {...common} d="M10 24V11.5c0-.8.7-1.5 1.5-1.5h9c.8 0 1.5.7 1.5 1.5V24" />
          <path {...common} d="M22 14h5.5c.8 0 1.5.7 1.5 1.5V24" />
          <path {...common} d="M14 14h4" />
          <path {...common} d="M14 18h4" />
          <path {...common} d="M15 24v-4h2v4" />
        </>
      );
    case 'events':
      return (
        <>
          <path {...common} d="M12.5 11h15a1.5 1.5 0 0 1 1.5 1.5v2c-1.7 0-3 1.4-3 3 0 1.7 1.3 3 3 3v2A1.5 1.5 0 0 1 27.5 24h-15A1.5 1.5 0 0 1 11 22.5v-2c1.7 0 3-1.3 3-3 0-1.6-1.3-3-3-3v-2A1.5 1.5 0 0 1 12.5 11Z" />
          <path {...common} d="M19.5 14.5v6" />
          <path {...common} d="M17 17.5h5" />
        </>
      );
    case 'transport':
      return (
        <>
          <path {...common} d="M12 21.5V14c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v7.5" />
          <path {...common} d="M12 19h16" />
          <path {...common} d="M16 13h8" />
          <circle cx="16" cy="22.5" r="1.8" fill="currentColor" />
          <circle cx="24" cy="22.5" r="1.8" fill="currentColor" />
        </>
      );
    case 'atm':
      return (
        <>
          <rect x="9.5" y="10" width="21" height="14" rx="3" {...common} />
          <path {...common} d="M13 15h7" />
          <path {...common} d="M13 19h4" />
          <path {...common} d="M24 14.5h3" />
          <path {...common} d="M25.5 13v3" />
        </>
      );
    case 'shops':
      return (
        <>
          <path {...common} d="M12.5 14h15l-1.2 10H13.7L12.5 14Z" />
          <path {...common} d="M16 14v-1.2c0-2.1 1.7-3.8 3.8-3.8h.4c2.1 0 3.8 1.7 3.8 3.8V14" />
          <path {...common} d="M18.5 18.5h3" />
        </>
      );
    case 'culture':
      return (
        <>
          <path {...common} d="M10 14l6-3 6 3 6-3" />
          <path {...common} d="M11 24h18" />
          <path {...common} d="M13 14v8" />
          <path {...common} d="M19 14v8" />
          <path {...common} d="M25 14v8" />
          <path {...common} d="M9.5 24h21" />
          <path {...common} d="M16 11h10" />
        </>
      );
    case 'kids':
      return (
        <>
          <path {...common} d="M16 10l7 5-7 5-7-5 7-5Z" />
          <path {...common} d="M23 15l3.5 6.5" />
          <path {...common} d="M26.5 21.5l-1.8 1.8" />
          <path {...common} d="M16 20v4" />
        </>
      );
    case 'medicine':
      return (
        <>
          <rect x="12" y="9.5" width="8" height="15" rx="4" {...common} />
          <path {...common} d="M20 13h1c2.8 0 5 2.2 5 5s-2.2 5-5 5h-1" />
          <path {...common} d="M16 13v7" />
          <path {...common} d="M12.5 16.5h7" />
        </>
      );
    case 'photo-spots':
      return (
        <>
          <rect x="10" y="12" width="20" height="12" rx="3" {...common} />
          <circle cx="20" cy="18" r="4" {...common} />
          <path {...common} d="M14 12l2-2h4l2 2" />
        </>
      );
    case 'car-rental':
      return (
        <>
          <path {...common} d="M12 20.5l1.5-4.8c.4-1.1 1.4-1.8 2.6-1.8h7.8c1.2 0 2.2.7 2.6 1.8l1.5 4.8" />
          <path {...common} d="M10.5 20.5h19" />
          <circle cx="15.5" cy="22.5" r="1.7" fill="currentColor" />
          <circle cx="24.5" cy="22.5" r="1.7" fill="currentColor" />
        </>
      );
    default:
      return <circle cx="20" cy="18" r="6" {...common} />;
  }
}

export function CategoryIcon({ categoryId, size = 'md', className = '', title }: CategoryIconProps) {
  const palette = paletteMap[categoryId];
  const gradientId = `icon-gradient-${categoryId}`;

  const style = {
    ['--icon-start' as string]: palette.start,
    ['--icon-end' as string]: palette.end,
    ['--icon-glow' as string]: palette.glow
  } as CSSProperties;

  return (
    <span
      className={`category-icon category-icon--${size} ${className}`.trim()}
      style={style}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      aria-label={title}
    >
      <svg viewBox="0 0 40 40" className="category-icon__svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="8" y1="7" x2="31" y2="33" gradientUnits="userSpaceOnUse">
            <stop stopColor={palette.start} />
            <stop offset="1" stopColor={palette.end} />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="17" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.16)" />
        <circle cx="28.5" cy="11.5" r="5.5" fill={`url(#${gradientId})`} opacity="0.28" />
        <circle cx="13" cy="28.5" r="7" fill="rgba(255,255,255,0.04)" />
        <g style={{ color: '#fff9f0' }}>
          <IconShape categoryId={categoryId} />
        </g>
      </svg>
    </span>
  );
}
