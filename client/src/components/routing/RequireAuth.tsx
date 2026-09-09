import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/components/FullPageLoader';

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}

export function RequireOnboardingInProgress() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingCompleted) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (user) return <Navigate to={user.onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;

  return <Outlet />;
}
