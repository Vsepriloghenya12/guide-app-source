import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BootGate } from './boot/BootGate';
import { UserAuthProvider } from './components/auth/UserAuthProvider';
import { SecretThemeProvider } from './secretTheme/SecretThemeProvider';
import './styles/theme.css';
import './styles/app.css';
import './styles/reference-rebuild.css';
import { applyStandaloneModeClass, registerServiceWorker } from './pwa/registerServiceWorker';

applyStandaloneModeClass();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SecretThemeProvider>
      <BootGate>
        <BrowserRouter>
          <UserAuthProvider>
            <App />
          </UserAuthProvider>
        </BrowserRouter>
      </BootGate>
    </SecretThemeProvider>
  </React.StrictMode>
);
