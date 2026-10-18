import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHome from '@/pages/DashboardHome';
import PersonasPage from '@/pages/PersonasPage';
import AutomationsPage from '@/pages/AutomationsPage';
import CalendarPage from '@/pages/CalendarPage';
import SettingsPage from '@/pages/SettingsPage';
import BillingPage from '@/pages/BillingPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isOnboarded } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route path="/calendar" element={<Navigate to="/dashboard/calendar" replace />} />
      <Route path="/personas" element={<Navigate to="/dashboard/personas" replace />} />
      <Route path="/automations" element={<Navigate to="/dashboard/automations" replace />} />
      <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
      <Route path="/billing" element={<Navigate to="/dashboard/billing" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/personas"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PersonasPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/automations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AutomationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/calendar"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CalendarPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/billing"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BillingPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
