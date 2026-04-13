import { useEffect, useMemo, useState, type CSSProperties, type PropsWithChildren } from 'react';
import { isBootReady, setBootReady } from './bootState';

type BootProgress = {
  total: number;
  done: number;
};

let bootPromise: Promise<void> | null = null;

const bootLogoPieces = [
  { id: 'mountains', src: '/boot-logo/mountains.png', modifier: 'mountains' },
  { id: 'tower', src: '/boot-logo/tower.png', modifier: 'tower' },
  { id: 'bridge', src: '/boot-logo/bridge.png', modifier: 'bridge' },
  { id: 'wheel', src: '/boot-logo/wheel.png', modifier: 'wheel' },
  { id: 'wave', src: '/boot-logo/wave.png', modifier: 'wave' },
  { id: 'wordmark', src: '/boot-logo/wordmark.png', modifier: 'wordmark' }
] as const;

function isVideoAsset(url: string) {
  return /\.(mp4|webm|mov)$/i.test(url);
}

function collectBootAssets() {
  return [
    '/home-hero-background.png',
    '/home-hero-logo-custom.png',
    '/home-hero-logo.png',
    '/logo.png',
    '/logo.svg',
    ...bootLogoPieces.map((piece) => piece.src)
  ];
}

function preloadAsset(url: string) {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    if (isVideoAsset(url)) {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const cleanup = () => {
        video.removeAttribute('src');
        video.load();
      };
      const done = () => {
        cleanup();
        resolve();
      };
      video.onloadeddata = done;
      video.onerror = done;
      video.src = url;
      return;
    }

    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
}

async function runBoot(onProgress: (progress: BootProgress) => void) {
  const assets = collectBootAssets();
  const total = Math.max(assets.length, 1);
  let done = 0;

  onProgress({ total, done });

  await Promise.allSettled(
    assets.map(async (asset) => {
      await preloadAsset(asset);
      done += 1;
      onProgress({ total, done });
    })
  );

  setBootReady(true);
}

export function BootGate({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(isBootReady());
  const [progress, setProgress] = useState<BootProgress>({ total: 1, done: isBootReady() ? 1 : 0 });

  useEffect(() => {
    if (ready) {
      return;
    }

    let active = true;

    if (!bootPromise) {
      bootPromise = runBoot((nextProgress) => {
        if (!active) {
          return;
        }
        setProgress(nextProgress);
      });
    }

    void bootPromise
      .then(() => {
        if (active) {
          setReady(true);
        }
      })
      .catch(() => {
        setBootReady(true);
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [ready]);

  const percent = useMemo(() => {
    const value = progress.done / Math.max(progress.total, 1);
    return Math.max(8, Math.min(100, Math.round(value * 100)));
  }, [progress.done, progress.total]);

  if (!ready) {
    return (
      <div className="boot-splash" role="status" aria-live="polite" aria-label="Приложение загружается">
        <div className="boot-splash__backdrop" />
        <div className="boot-splash__content">
          <div className="boot-splash__scene" aria-hidden="true">
            {bootLogoPieces.map((piece, index) => (
              <span
                key={piece.id}
                className={`boot-splash__piece boot-splash__piece--${piece.modifier}`}
                style={{ '--piece-delay': `${0.08 + index * 0.12}s` } as CSSProperties}
              >
                <img src={piece.src} alt="" decoding="async" />
              </span>
            ))}
          </div>
          <div className="boot-splash__meta">
            <strong>Открываю Danang Guide…</strong>
            <span>Подгружаю экран, карточки и оформление перед входом в приложение</span>
          </div>
          <div className="boot-progress" aria-hidden="true">
            <span className="boot-progress__bar" style={{ width: `${percent}%` }} />
          </div>
          <div className="boot-splash__percent">{percent}%</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
