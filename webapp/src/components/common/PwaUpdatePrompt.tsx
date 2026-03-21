import { useEffect, useState } from 'react';
import { activatePendingUpdate, PWA_UPDATE_READY_EVENT } from '../../pwa/registerServiceWorker';

export function PwaUpdatePrompt() {
  const [updateReady, setUpdateReady] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const handleUpdateReady = () => setUpdateReady(true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener(PWA_UPDATE_READY_EVENT, handleUpdateReady);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener(PWA_UPDATE_READY_EVENT, handleUpdateReady);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleApplyUpdate = () => {
    setIsApplying(true);
    activatePendingUpdate();
  };

  return (
    <>
      {!isOnline ? (
        <aside className="pwa-status-banner pwa-status-banner--offline" aria-live="polite">
          <strong>Ты офлайн.</strong>
          <span>Откроются кэшированные экраны и офлайн-страница, но свежие данные загрузятся после возврата сети.</span>
        </aside>
      ) : null}

      {updateReady ? (
        <aside className="pwa-status-banner pwa-status-banner--update" aria-live="polite">
          <div>
            <strong>Доступно обновление приложения</strong>
            <span>Можно обновить интерфейс без ручной очистки кэша и получить свежий контент.</span>
          </div>
          <div className="pwa-status-banner__actions">
            <button className="button button--primary button--small" type="button" onClick={handleApplyUpdate} disabled={isApplying}>
              {isApplying ? 'Обновляю…' : 'Обновить'}
            </button>
            <button className="button button--ghost button--small" type="button" onClick={() => setUpdateReady(false)} disabled={isApplying}>
              Позже
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
