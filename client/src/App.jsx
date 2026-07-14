import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Theme imports
import { getMuiTheme } from './theme/themeConfig';

// Store imports
import { useAuthStore } from './store/useAuthStore';

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Pages
import Login from './pages/Login';
import UserProfileSetup from './pages/UserProfileSetup';
import Dashboard from './pages/Dashboard';
import CharacterListing from './pages/CharacterListing';
import AssessmentForm from './pages/AssessmentForm';
import AssessmentAggregate from './pages/AssessmentAggregate';
import AssessmentHistory from './pages/AssessmentHistory';
import PersonalNotes from './pages/PersonalNotes';
import Help from './pages/Help';
import Settings from './pages/Settings';

function App() {
  const { user } = useAuthStore();
  
  // Select and generate MUI theme dynamically
  const activeTheme = user?.profile?.theme || 'Serenity';
  const muiTheme = getMuiTheme(activeTheme);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
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
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/characters"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CharacterListing />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assess/:characterId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AssessmentForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/aggregate/:characterId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AssessmentAggregate />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AssessmentHistory />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Help />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Add a journals/notes route */}
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PersonalNotes />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect all unmatched routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
