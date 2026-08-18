import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Theme imports
import { getMuiTheme } from './theme/themeConfig';

// Store imports
import { useAuthStore } from './store/useAuthStore';

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import PolicyAcknowledgmentDialog from './components/PolicyAcknowledgmentDialog';
import LoginTraitPopup from './components/LoginTraitPopup';
import ScrollToTop from './components/ScrollToTop';

// Helper to retry dynamic imports (ChunkLoadError recovery) when new builds are deployed
const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Chunk loading failed. Reloading page to fetch latest build...", error);
      window.location.reload();
      return { default: () => null };
    }
  });
};

// Pages - Lazy Loaded for 100% navigation and load performance
const Login = lazyWithRetry(() => import('./pages/Login'));
const UserProfileSetup = lazyWithRetry(() => import('./pages/UserProfileSetup'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const CharacterListing = lazyWithRetry(() => import('./pages/CharacterListing'));
const AssessmentForm = lazyWithRetry(() => import('./pages/AssessmentForm'));
const AssessmentAggregate = lazyWithRetry(() => import('./pages/AssessmentAggregate'));
const AssessmentHistory = lazyWithRetry(() => import('./pages/AssessmentHistory'));
const PersonalNotes = lazyWithRetry(() => import('./pages/PersonalNotes'));
const Inspiration = lazyWithRetry(() => import('./pages/Inspiration'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));

function App() {
  const { user, checkAuth } = useAuthStore();

  // Validate session on mount
  React.useEffect(() => {
    // Skip verification if we are currently handling a redirect callback in the URL
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('accessToken') || searchParams.has('isNewUser')) {
      return;
    }
    
    // Skip verification for guests who do not have any stored session tokens
    const hasAccessToken = !!localStorage.getItem('accessToken');
    const hasRefreshToken = !!localStorage.getItem('refreshToken');
    if (!hasAccessToken && !hasRefreshToken) {
      return;
    }

    checkAuth();
  }, [checkAuth]);

  // Geolocation detection for user country & city
  React.useEffect(() => {
    if (user && user.profile && (!user.profile.country || !user.profile.city)) {
      const detectLocation = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data.country_name || data.city) {
              const { updateProfile } = useAuthStore.getState();
              await updateProfile(
                undefined,
                undefined,
                undefined,
                data.country ? data.country.toLowerCase() : 'unknown',
                data.city || 'Unknown'
              );
            }
          }
        } catch (err) {
          console.warn('Geolocation detection failed:', err);
        }
      };
      detectLocation();
    }
  }, [user]);
  
  // Select and generate MUI theme dynamically
  const activeTheme = user?.profile?.theme || 'Classic';
  const muiTheme = getMuiTheme(activeTheme);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <PolicyAcknowledgmentDialog />
        <LoginTraitPopup />
        <Suspense fallback={
          <Box className="flex flex-col items-center justify-center min-h-screen bg-themeBg theme-transition">
            <CircularProgress className="text-orange-500" />
          </Box>
        }>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Onboarding Profile Setup Route (Authenticated only) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireProfile={false}>
                <UserProfileSetup />
              </ProtectedRoute>
            }
          />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/characters" element={<CharacterListing />} />
            <Route path="/assess/:characterId" element={<AssessmentForm />} />
            <Route path="/aggregate/:characterId" element={<AssessmentAggregate />} />
            <Route path="/history" element={<AssessmentHistory />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/help" element={<Navigate to="/inspiration" replace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notes" element={<PersonalNotes />} />
          </Route>

          {/* Admin Panel Route */}
          <Route
            element={
              <ProtectedRoute requireAdmin={true}>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          {/* Redirect all unmatched routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
