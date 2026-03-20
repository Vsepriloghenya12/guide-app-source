type CategoryIconProps = {
  type: 'food' | 'fun' | 'culture' | 'spa' | 'shopping' | 'nature';
};

export function CategoryIcon({ type }: CategoryIconProps) {
  const commonProps = {
    viewBox: '0 0 48 48',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  };

  switch (type) {
    case 'food':
      return (
        <svg {...commonProps}>
          <path d="M14 7V21" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 7V21" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M17 7V41" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 7C29.5 10 28 13.5 28 19V28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 7V41" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'fun':
      return (
        <svg {...commonProps}>
          <path d="M11 15H37L30 24C28.5 25.9 26.2 27 23.8 27H19.5C17.1 27 14.8 25.9 13.3 24L11 15Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M24 27V37" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M17 37H31" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M29 11L35 5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'culture':
      return (
        <svg {...commonProps}>
          <path d="M9 20L24 8L39 20" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M13 20V37" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M24 20V37" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M35 20V37" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M9 37H39" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'spa':
      return (
        <svg {...commonProps}>
          <path d="M24 11C20.5 14.5 18 18.3 18 22.5C18 27.7 21.7 32 24 34C26.3 32 30 27.7 30 22.5C30 18.3 27.5 14.5 24 11Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M14 31C16.2 28.9 19.3 27.5 24 27.5C28.7 27.5 31.8 28.9 34 31" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'shopping':
      return (
        <svg {...commonProps}>
          <path d="M13 17H35L32.5 37H15.5L13 17Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M19 17V14C19 11.2 21.2 9 24 9C26.8 9 29 11.2 29 14V17" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'nature':
      return (
        <svg {...commonProps}>
          <path d="M24 8L12 26H36L24 8Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M24 20L10 40H38L24 20Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
