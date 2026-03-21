import { Navigate, useLocation } from 'react-router-dom';
import { isOwnerAuthenticated } from '../../utils/ownerAuth';
import { PropsWithChildren } from 'react';

export function RequireOwner({ children }: PropsWithChildren) {
  const location = useLocation();

  if (!isOwnerAuthenticated()) {
    return <Navigate to="/owner-login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
