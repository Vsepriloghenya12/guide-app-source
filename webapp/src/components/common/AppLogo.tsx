import { useMemo, useState } from 'react';
import type { HomeLogoMedia } from '../../types';

type AppLogoProps = {
  className?: string;
  alt?: string;
  media?: HomeLogoMedia | null;
};

type LogoCandidate = {
  type: 'image' | 'video';
  src: string;
  posterSrc?: string;
};

const LOGO_CANDIDATES: LogoCandidate[] = [
  { type: 'video', src: '/logo.mp4', posterSrc: '/logo-poster.png' },
  { type: 'video', src: '/logo.webm', posterSrc: '/logo-poster.png' },
  { type: 'video', src: '/logo.mov', posterSrc: '/logo-poster.png' },
  { type: 'image', src: '/danang-guide-logo.png' },
  { type: 'image', src: '/logo.png' },
  { type: 'image', src: '/logo.svg' },
  { type: 'image', src: '/logo.jpg' },
  { type: 'image', src: '/logo.jpeg' },
  { type: 'image', src: '/logo-placeholder.svg' }
];

function isVideoSource(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

function normalizeMedia(media: HomeLogoMedia | null | undefined, fallbackAlt: string): LogoCandidate | null {
  if (!media?.src) {
    return null;
  }

  return {
    type: media.type || (isVideoSource(media.src) ? 'video' : 'image'),
    src: media.src,
    posterSrc: media.posterSrc || undefined
  };
}

export function AppLogo({ className, alt = 'Логотип Danang Guide', media }: AppLogoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentAsset = useMemo(() => {
    return normalizeMedia(media, alt) ?? LOGO_CANDIDATES[currentIndex] ?? LOGO_CANDIDATES[LOGO_CANDIDATES.length - 1];
  }, [alt, currentIndex, media]);

  const advanceFallback = () => {
    if (media?.src) {
      return;
    }

    setCurrentIndex((prev) => {
      if (prev >= LOGO_CANDIDATES.length - 1) {
        return prev;
      }
      return prev + 1;
    });
  };

  if (currentAsset.type === 'video') {
    return (
      <video
        className={className}
        src={currentAsset.src}
        poster={currentAsset.posterSrc}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        aria-label={alt}
        onError={advanceFallback}
      />
    );
  }

  return <img className={className} src={currentAsset.src} alt={alt} decoding="async" onError={advanceFallback} />;
}
