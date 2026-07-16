import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute = ({ children, requireProfile = true, requireAdmin = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin role and user is not admin, redirect to dashboard
  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // If user profile is not set up (no age group), force redirect to onboarding
  if (requireProfile && (!user?.profile || !user.profile.ageGroup)) {
    // Prevent redirect loop if already going to onboarding
    if (location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
