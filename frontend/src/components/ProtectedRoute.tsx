import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();

  if (!authEnabled) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
