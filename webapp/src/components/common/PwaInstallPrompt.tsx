import { useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'dg:pwa-install-dismissed';

function isIosDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() ?? '';
  return /iphone|ipad|ipod/.test(userAgent) || (platform === 'macintel' && navigator.maxTouchPoints > 1);
}

function isSafariBrowser() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /safari/.test(userAgent) && !/crios|fxios|edgios|chrome|android/.test(userAgent);
}

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);

  const canShowIosInstructions = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return isIosDevice() && isSafariBrowser() && !isStandaloneMode();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setInstalled(isStandaloneMode());
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === '1');

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      window.sessionStorage.removeItem(DISMISS_KEY);
      setDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const hidePrompt = () => {
    setDismissed(true);
    window.sessionStorage.setItem(DISMISS_KEY, '1');
  };

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => ({ outcome: 'dismissed' as const, platform: 'web' }));

    if (choice.outcome !== 'accepted') {
      hidePrompt();
      return;
    }

    setDismissed(true);
    setInstallEvent(null);
  };

  if (installed || dismissed) {
    return null;
  }

  if (!installEvent && !canShowIosInstructions) {
    return null;
  }

  return (
    <aside className="pwa-prompt" aria-label="Установка приложения">
      <div className="pwa-prompt__content">
        <div className="pwa-prompt__eyebrow">Установить на телефон</div>
        <h3 className="pwa-prompt__title">Danang Guide как приложение</h3>
        {installEvent ? (
          <p className="pwa-prompt__text">
            Установи приложение на главный экран, чтобы оно открывалось быстрее и работало стабильнее как PWA.
          </p>
        ) : (
          <p className="pwa-prompt__text">
            На iPhone открой сайт в Safari → нажми «Поделиться» → «На экран “Домой”» → включи «Открывать как веб‑приложение».
          </p>
        )}
      </div>
      <div className="pwa-prompt__actions">
        {installEvent ? (
          <button type="button" className="button button--primary pwa-prompt__button" onClick={handleInstall}>
            Установить
          </button>
        ) : null}
        <button type="button" className="button button--ghost pwa-prompt__button" onClick={hidePrompt}>
          Позже
        </button>
      </div>
    </aside>
  );
}
