import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { syncTailwindDarkMode } from '../utils/theme';
import { api } from '../api/client';

export { api };

export const useAuthStore = create((set, get) => {
  // Initialize state from localStorage
  const savedToken = localStorage.getItem('accessToken');
  const savedRefreshToken = localStorage.getItem('refreshToken');
  let savedUser = null;
  
  try {
    const rawUser = localStorage.getItem('user');
    savedUser = rawUser ? JSON.parse(rawUser) : null;
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
  }

  const initialTheme = savedUser?.profile?.theme || 'Classic';
  syncTailwindDarkMode(initialTheme);

  return {
    accessToken: savedToken || null,
    refreshToken: savedRefreshToken || null,
    user: savedUser || null,
    isAuthenticated: !!savedToken,
    isLoading: false,
    error: null,

    // Actions
    login: async ({ credential, isMock, email, name, picture }) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authService.loginWithGoogle({ credential, isMock, email, name, picture });
        const { accessToken, refreshToken, user, isNewUser } = data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        syncTailwindDarkMode(user.profile?.theme || 'Classic');

        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false
        });

        return { isNewUser };
      } catch (err) {
        console.error('Login action error:', err);
        const errMsg = err.response?.data?.message || 'Login failed. Please try again.';
        set({ error: errMsg, isLoading: false });
        throw new Error(errMsg);
      }
    },

    setRedirectSession: async (accessToken, refreshToken) => {
      set({ isLoading: true, error: null });
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const data = await authService.getCurrentUser(accessToken);
        const { user } = data;

        localStorage.setItem('user', JSON.stringify(user));
        syncTailwindDarkMode(user.profile?.theme || 'Classic');

        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false
        });

        return user;
      } catch (err) {
        console.error('Redirect session error:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed. Please try again.'
        });
        throw err;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      const currentRefreshToken = get().refreshToken;
      try {
        await authService.logout(currentRefreshToken);
      } catch (err) {
        console.error('Logout API error:', err);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        document.documentElement.classList.remove('dark');

        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    },

    updateProfile: async (ageGroup, theme) => {
      set({ isLoading: true, error: null });
      try {
        const token = get().accessToken;
        const data = await profileService.updateProfile({ ageGroup, theme }, token);
        const updatedProfile = data.profile;
        const currentUser = get().user;
        const updatedUser = {
          ...currentUser,
          profile: updatedProfile
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        syncTailwindDarkMode(theme);

        set({
          user: updatedUser,
          isLoading: false
        });

        return updatedProfile;
      } catch (err) {
        console.error('Update profile error:', err);
        const errMsg = err.response?.data?.message || 'Failed to update profile.';
        set({ error: errMsg, isLoading: false });
        throw new Error(errMsg);
      }
    },

    setTheme: async (themeName) => {
      const currentUser = get().user;
      if (!currentUser) return;
      
      const ageGroup = currentUser.profile?.ageGroup || '';
      await get().updateProfile(ageGroup, themeName);
    },

    refreshSession: async () => {
      const currentRefreshToken = get().refreshToken;
      if (!currentRefreshToken) return false;

      try {
        const data = await authService.refreshToken(currentRefreshToken);
        const { accessToken, refreshToken } = data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({
          accessToken,
          refreshToken,
          isAuthenticated: true
        });

        return accessToken;
      } catch (err) {
        console.error('Session refresh failed:', err);
        get().logout();
        return false;
      }
    }
  };
});
