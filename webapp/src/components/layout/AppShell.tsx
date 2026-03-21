import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { PwaInstallPrompt } from '../common/PwaInstallPrompt';
import { getAnalyticsLabelByPath, recordGuideAnalytics } from '../../utils/analytics';

export function AppShell() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/owner')) {
      return;
    }

    recordGuideAnalytics({
      kind: 'page-view',
      label: getAnalyticsLabelByPath(location.pathname),
      path: location.pathname
    });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <div className="app-gradient app-gradient-top" />
      <div className="app-gradient app-gradient-bottom" />
      <main className="app-main">
        <Outlet />
      </main>
      <PwaInstallPrompt />
      <BottomNav />
    </div>
  );
}
