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

// Pages - Lazy Loaded for 100% navigation and load performance
const Login = lazy(() => import('./pages/Login'));
const UserProfileSetup = lazy(() => import('./pages/UserProfileSetup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CharacterListing = lazy(() => import('./pages/CharacterListing'));
const AssessmentForm = lazy(() => import('./pages/AssessmentForm'));
const AssessmentAggregate = lazy(() => import('./pages/AssessmentAggregate'));
const AssessmentHistory = lazy(() => import('./pages/AssessmentHistory'));
const PersonalNotes = lazy(() => import('./pages/PersonalNotes'));
const Help = lazy(() => import('./pages/Help'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  const { user } = useAuthStore();
  
  // Select and generate MUI theme dynamically
  const activeTheme = user?.profile?.theme || 'Classic';
  const muiTheme = getMuiTheme(activeTheme);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
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
            <Route path="/help" element={<Help />} />
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
