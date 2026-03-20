import { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../../api/client';

export function RequireOwner({ children }: PropsWithChildren) {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    let isMounted = true;
    api
      .ownerSession()
      .then((response) => {
        if (!isMounted) return;
        setStatus(response.authenticated ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (isMounted) setStatus('denied');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (status === 'loading') {
    return <div className="page-loader">Проверяем owner-сессию…</div>;
  }

  if (status === 'denied') {
    return <Navigate to="/owner-login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
