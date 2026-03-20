import { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isOwnerAuthenticated } from '../../utils/ownerAuth';

export function RequireOwner({ children }: PropsWithChildren) {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const authenticated = await isOwnerAuthenticated();
      if (!isMounted) {
        return;
      }
      setStatus(authenticated ? 'allowed' : 'denied');
    };

    void check();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (status === 'loading') {
    return (
      <div className="page-stack owner-login-page">
        <section className="owner-login-card">
          <div className="owner-login-card__intro">
            <span className="eyebrow">Owner access</span>
            <h2>Проверяем owner-сессию</h2>
            <p>Закрытая часть приложения доступна только после серверного входа.</p>
          </div>
        </section>
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/owner-login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
