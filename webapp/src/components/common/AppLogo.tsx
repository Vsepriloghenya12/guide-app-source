import { useMemo, useState } from 'react';

type AppLogoProps = {
  className?: string;
  alt?: string;
};

const LOGO_CANDIDATES = [
  '/danang-guide-logo.png',
  '/logo.png',
  '/logo.svg',
  '/logo.jpg',
  '/logo.jpeg',
  '/logo-placeholder.svg'
];

export function AppLogo({ className, alt = 'Логотип Danang Guide' }: AppLogoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSrc = useMemo(() => {
    return LOGO_CANDIDATES[currentIndex] ?? '/logo-placeholder.svg';
  }, [currentIndex]);

  return (
    <img
      className={className}
      src={currentSrc}
      alt={alt}
      onError={() => {
        setCurrentIndex((prev) => {
          if (prev >= LOGO_CANDIDATES.length - 1) {
            return prev;
          }

          return prev + 1;
        });
      }}
    />
  );
}
