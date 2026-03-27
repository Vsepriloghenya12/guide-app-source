import { useMemo, useState, type CSSProperties } from 'react';
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

type LogoPiece = {
  clipPath: string;
  fromX: string;
  fromY: string;
  delayMs: number;
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

const LOGO_PIECES: LogoPiece[] = [
  { clipPath: 'polygon(0 0, 35% 0, 27% 39%, 0 49%)', fromX: '-58px', fromY: '-34px', delayMs: 0 },
  { clipPath: 'polygon(35% 0, 68% 0, 61% 41%, 27% 39%)', fromX: '0px', fromY: '-48px', delayMs: 120 },
  { clipPath: 'polygon(68% 0, 100% 0, 100% 47%, 61% 41%)', fromX: '56px', fromY: '-30px', delayMs: 240 },
  { clipPath: 'polygon(0 49%, 27% 39%, 34% 100%, 0 100%)', fromX: '-48px', fromY: '44px', delayMs: 360 },
  { clipPath: 'polygon(27% 39%, 61% 41%, 72% 100%, 34% 100%)', fromX: '0px', fromY: '58px', delayMs: 480 },
  { clipPath: 'polygon(61% 41%, 100% 47%, 100% 100%, 72% 100%)', fromX: '52px', fromY: '40px', delayMs: 600 }
];

function isVideoSource(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

function normalizeMedia(media: HomeLogoMedia | null | undefined): LogoCandidate | null {
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
    return normalizeMedia(media) ?? LOGO_CANDIDATES[currentIndex] ?? LOGO_CANDIDATES[LOGO_CANDIDATES.length - 1];
  }, [currentIndex, media]);

  const previewSrc = currentAsset.type === 'video' ? currentAsset.posterSrc || '/logo-poster.png' : currentAsset.src;

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

  const wrapperClassName = [
    'app-logo-assembly',
    currentAsset.type === 'video' ? 'app-logo-assembly--video' : 'app-logo-assembly--image',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassName} aria-label={alt}>
      <span className="app-logo-assembly__stage" aria-hidden="true">
        {previewSrc
          ? LOGO_PIECES.map((piece, index) => {
              const style = {
                backgroundImage: `url("${previewSrc}")`,
                ['--logo-piece-clip' as string]: piece.clipPath,
                ['--logo-piece-from-x' as string]: piece.fromX,
                ['--logo-piece-from-y' as string]: piece.fromY,
                ['--logo-piece-delay' as string]: `${piece.delayMs}ms`
              } as CSSProperties;

              return <span key={`${currentAsset.src}-${index}`} className="app-logo-assembly__piece" style={style} />;
            })
          : null}
      </span>

      {currentAsset.type === 'video' ? (
        <video
          className="app-logo-assembly__media"
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
      ) : (
        <img className="app-logo-assembly__media" src={currentAsset.src} alt={alt} decoding="async" onError={advanceFallback} />
      )}
    </div>
  );
}
