import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/theme.css';
import './styles/app.css';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`/sw.js?v=${__APP_VERSION__}`, {
        updateViaCache: 'none'
      });

      let shouldRefresh = false;

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (shouldRefresh) {
          window.location.reload();
        }
      });

      if (registration.waiting) {
        shouldRefresh = true;
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) {
          return;
        }

        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            shouldRefresh = true;
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      registration.update().catch(() => undefined);
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
