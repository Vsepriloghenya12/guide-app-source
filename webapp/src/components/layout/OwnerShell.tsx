import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { OWNER_AUTH_REQUIRED_EVENT } from '../../utils/ownerEvents';

export function OwnerShell() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRequired = () => {
      navigate('/owner-login', { replace: true });
    };

    window.addEventListener(OWNER_AUTH_REQUIRED_EVENT, handleAuthRequired);
    return () => {
      window.removeEventListener(OWNER_AUTH_REQUIRED_EVENT, handleAuthRequired);
    };
  }, [navigate]);

  return (
    <div className="owner-shell">
      <main className="owner-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
