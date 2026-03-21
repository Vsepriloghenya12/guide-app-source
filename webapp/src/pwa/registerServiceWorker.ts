const SW_URL = '/sw.js';
export const PWA_UPDATE_READY_EVENT = 'dg:pwa-update-ready';

let pendingRegistration: ServiceWorkerRegistration | null = null;

export function applyStandaloneModeClass() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  document.documentElement.classList.toggle('display-mode-standalone', standalone);
}

export function activatePendingUpdate() {
  pendingRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
}

function dispatchUpdateReady(registration: ServiceWorkerRegistration) {
  pendingRegistration = registration;
  window.dispatchEvent(new Event(PWA_UPDATE_READY_EVENT));
}

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  let refreshing = false;

  const handleControllerChange = () => {
    if (refreshing) {
      return;
    }

    refreshing = true;
    window.location.reload();
  };

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(SW_URL, { scope: '/' });

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      if (registration.waiting) {
        dispatchUpdateReady(registration);
      }

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            dispatchUpdateReady(registration);
          }
        });
      });

      const refreshWorker = () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => undefined);
        }
      };

      document.addEventListener('visibilitychange', refreshWorker);
      window.addEventListener('focus', refreshWorker);

      window.setInterval(() => {
        registration.update().catch(() => undefined);
      }, 60 * 60 * 1000);
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}
