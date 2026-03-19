import { PropsWithChildren } from 'react';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <div className="app-gradient app-gradient-top" />
      <div className="app-gradient app-gradient-bottom" />
      <main className="app-main">{children}</main>
      <BottomNav />
    </div>
  );
}
