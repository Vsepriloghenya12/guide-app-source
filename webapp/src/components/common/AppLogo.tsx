import { useMemo, useState } from 'react';
import type { HomeLogoMedia } from '../../types';
import { useSecretTheme } from '../../secretTheme/SecretThemeProvider';

type AppLogoProps = {
  className?: string;
  alt?: string;
  media?: HomeLogoMedia | null;
  animated?: boolean;
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

function DefaultLogoMedia({ asset, alt, onError }: { asset: LogoCandidate; alt: string; onError: () => void }) {
  if (asset.type === 'video') {
    return (
      <video
        className="app-logo-media"
        src={asset.src}
        poster={asset.posterSrc}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        aria-label={alt}
        onError={onError}
      />
    );
  }

  return <img className="app-logo-media" src={asset.src} alt={alt} decoding="async" onError={onError} />;
}

function LogoSceneSvg({ variant }: { variant: 'default' | 'secret' }) {
  return (
    <svg className={`logo-cinematic__scene logo-cinematic__scene--${variant}`} viewBox="0 0 960 440" aria-hidden="true">
      <defs>
        <linearGradient id="logoSkyGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={variant === 'secret' ? '#1b0f18' : '#17304f'} />
          <stop offset="48%" stopColor={variant === 'secret' ? '#422036' : '#355d8b'} />
          <stop offset="100%" stopColor={variant === 'secret' ? '#f59a52' : '#f7b25f'} />
        </linearGradient>
        <radialGradient id="logoSunGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7d0" />
          <stop offset="55%" stopColor="#ffd167" />
          <stop offset="100%" stopColor={variant === 'secret' ? '#d84757' : '#f18e50'} />
        </radialGradient>
        <linearGradient id="logoMountainBack" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={variant === 'secret' ? '#39213a' : '#35546e'} />
          <stop offset="100%" stopColor={variant === 'secret' ? '#110b16' : '#13273c'} />
        </linearGradient>
        <linearGradient id="logoMountainFront" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={variant === 'secret' ? '#6a3144' : '#40657e'} />
          <stop offset="100%" stopColor={variant === 'secret' ? '#1d0e14' : '#173146'} />
        </linearGradient>
        <linearGradient id="logoDragonGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ffda73" />
          <stop offset="50%" stopColor="#ffae43" />
          <stop offset="100%" stopColor="#ea5c2f" />
        </linearGradient>
      </defs>

      <rect x="90" y="46" width="780" height="260" rx="120" fill="url(#logoSkyGradient)" className="logo-cinematic__sky" />
      <g className="logo-cinematic__sun-group">
        <circle cx="470" cy="232" r="76" fill="url(#logoSunGradient)" className="logo-cinematic__sun-disc" />
        <circle cx="470" cy="232" r="108" fill="rgba(255,210,103,0.18)" className="logo-cinematic__sun-glow" />
      </g>
      <g className="logo-cinematic__mountain-back">
        <path d="M148 305 292 172l92 86 79-65 121 112Z" fill="url(#logoMountainBack)" />
      </g>
      <g className="logo-cinematic__mountain-front">
        <path d="M102 316 246 228l88 68 93-92 128 112Z" fill="url(#logoMountainFront)" />
      </g>
      <g className="logo-cinematic__waterline">
        <path d="M120 310c72 12 142 12 224 0 74-12 146-12 220 0 86 14 160 15 276 0v34H120Z" fill="rgba(255,255,255,0.14)" />
      </g>
      <g className="logo-cinematic__plane-group">
        <path d="M214 126c82-23 164-18 242 15" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="7" strokeLinecap="round" strokeDasharray="16 16" className="logo-cinematic__plane-trail" />
        <path d="M0-8 24 0 0 8l5-8z" fill="#fff8ef" className="logo-cinematic__plane" transform="translate(246 126) rotate(11)" />
      </g>
      <g className="logo-cinematic__dragon-group">
        <path
          d="M600 245c44-54 93-83 156-76 18 2 31 7 44 18-15 2-28 8-36 16 23 5 35 17 38 34-20-6-38-4-56 5-13 7-23 17-32 29-24 33-67 55-129 67 31-22 45-49 42-79 8 8 16 12 24 13-5-14-4-28 5-43-20 10-39 15-56 16Z"
          fill="url(#logoDragonGradient)"
          className="logo-cinematic__dragon"
        />
        <path
          d="M773 170c10-9 21-12 33-9-5 8-13 14-23 18l-10-9Z"
          fill="#fff3b8"
          className="logo-cinematic__dragon-horn"
        />
      </g>
      <g className="logo-cinematic__mist-group">
        <ellipse cx="325" cy="324" rx="168" ry="28" fill="rgba(255,255,255,0.12)" />
        <ellipse cx="650" cy="328" rx="178" ry="30" fill="rgba(255,255,255,0.1)" />
      </g>
    </svg>
  );
}

function CinematicLogoMedia({
  asset,
  alt,
  onError,
  variant
}: {
  asset: LogoCandidate;
  alt: string;
  onError: () => void;
  variant: 'default' | 'secret';
}) {
  const posterSrc = asset.type === 'video' ? asset.posterSrc || '/danang-guide-logo.png' : asset.src;

  return (
    <span className={`logo-cinematic logo-cinematic--${variant} logo-cinematic--${asset.type}`} aria-label={alt}>
      <LogoSceneSvg variant={variant} />
      <span className="logo-cinematic__media-wrap">
        {posterSrc ? <img className="logo-cinematic__poster" src={posterSrc} alt={alt} decoding="async" onError={onError} /> : null}
        {asset.type === 'video' ? (
          <video
            className="logo-cinematic__video"
            src={asset.src}
            poster={asset.posterSrc}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            aria-label={alt}
            onError={onError}
          />
        ) : null}
      </span>
    </span>
  );
}

export function AppLogo({ className, alt = 'Логотип Danang Guide', media, animated = false }: AppLogoProps) {
  const { isActive, manifest, registerLogoTap } = useSecretTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentAsset = useMemo(() => {
    const themeLogo = isActive && manifest?.logoSrc ? { type: 'image' as const, src: manifest.logoSrc } : null;
    return normalizeMedia(media) ?? themeLogo ?? LOGO_CANDIDATES[currentIndex] ?? LOGO_CANDIDATES[LOGO_CANDIDATES.length - 1];
  }, [currentIndex, isActive, manifest?.logoSrc, media]);

  const advanceFallback = () => {
    if (media?.src || (isActive && manifest?.logoSrc)) {
      return;
    }

    setCurrentIndex((prev) => {
      if (prev >= LOGO_CANDIDATES.length - 1) {
        return prev;
      }
      return prev + 1;
    });
  };

  const wrapperClassName = ['app-logo', className].filter(Boolean).join(' ');
  const hiddenToggleLabel = isActive
    ? 'Секретная тема активна. Нажмите логотип 10 раз, чтобы вернуть обычную тему.'
    : 'Нажмите логотип 10 раз, чтобы включить секретную тему.';

  return (
    <button type="button" className={wrapperClassName + ' app-logo-button'} onClick={registerLogoTap} aria-label={hiddenToggleLabel}>
      {animated ? (
        <CinematicLogoMedia asset={currentAsset} alt={isActive ? manifest?.logoAlt || alt : alt} onError={advanceFallback} variant={isActive ? 'secret' : 'default'} />
      ) : (
        <DefaultLogoMedia asset={currentAsset} alt={isActive ? manifest?.logoAlt || alt : alt} onError={advanceFallback} />
      )}
    </button>
  );
}
