import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { RequireAuth, RequireOnboardingInProgress, RedirectIfAuthenticated } from '@/components/routing/RequireAuth';

import { Landing } from '@/pages/Landing';
import { Pricing } from '@/pages/Pricing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Onboarding } from '@/pages/Onboarding';
import { Dashboard } from '@/pages/Dashboard';
import { CheckIn } from '@/pages/CheckIn';
import { CheckInHistory } from '@/pages/CheckInHistory';
import { Patterns } from '@/pages/Patterns';
import { PatternDetail } from '@/pages/PatternDetail';
import { Experiments } from '@/pages/Experiments';
import { ExperimentNew } from '@/pages/ExperimentNew';
import { ExperimentDetail } from '@/pages/ExperimentDetail';
import { Insights } from '@/pages/Insights';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route element={<RedirectIfAuthenticated />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Route>

            <Route element={<RequireOnboardingInProgress />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/check-in" element={<CheckIn />} />
                <Route path="/check-ins" element={<CheckInHistory />} />
                <Route path="/patterns" element={<Patterns />} />
                <Route path="/patterns/:id" element={<PatternDetail />} />
                <Route path="/experiments" element={<Experiments />} />
                <Route path="/experiments/new" element={<ExperimentNew />} />
                <Route path="/experiments/:id" element={<ExperimentDetail />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
