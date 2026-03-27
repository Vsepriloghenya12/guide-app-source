import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BootGate } from './boot/BootGate';
import { SecretThemeProvider } from './secretTheme/SecretThemeProvider';
import './styles/theme.css';
import './styles/app.css';
import { applyStandaloneModeClass, registerServiceWorker } from './pwa/registerServiceWorker';

applyStandaloneModeClass();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SecretThemeProvider>
      <BootGate>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BootGate>
    </SecretThemeProvider>
  </React.StrictMode>
);
