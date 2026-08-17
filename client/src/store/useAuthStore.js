import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { syncTailwindDarkMode } from '../utils/theme';
import { api } from '../api/client';

export { api };

export const useAuthStore = create((set, get) => {
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
    accessToken: null,
    refreshToken: null,
    user: savedUser || null,
    isAuthenticated: !!savedUser,
    isLoading: false,
    error: null,

    // Actions
    login: async ({ credential, isMock, email, name, picture }) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authService.loginWithGoogle({ credential, isMock, email, name, picture });
        const { user, isNewUser } = data;

        localStorage.setItem('user', JSON.stringify(user));

        syncTailwindDarkMode(user.profile?.theme || 'Classic');

        set({
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
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        const data = await authService.getCurrentUser(accessToken);
        const { user } = data;

        localStorage.setItem('user', JSON.stringify(user));
        syncTailwindDarkMode(user.profile?.theme || 'Classic');

        set({
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
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    },

    updateProfile: async (ageGroup, theme, streakType, country, city) => {
      set({ isLoading: true, error: null });
      try {
        const token = get().accessToken;
        const currentStreakType = streakType !== undefined ? streakType : (get().user?.profile?.streakType || 'Daily');
        const currentAgeGroup = ageGroup !== undefined ? ageGroup : (get().user?.profile?.ageGroup || '');
        const currentTheme = theme !== undefined ? theme : (get().user?.profile?.theme || 'Classic');
        const currentCountry = country !== undefined ? country : (get().user?.profile?.country || null);
        const currentCity = city !== undefined ? city : (get().user?.profile?.city || null);
        
        const data = await profileService.updateProfile({ 
          ageGroup: currentAgeGroup, 
          theme: currentTheme, 
          streakType: currentStreakType,
          country: currentCountry,
          city: currentCity
        }, token);
        
        const updatedProfile = data.profile;
        const currentUser = get().user;
        const updatedUser = {
          ...currentUser,
          profile: updatedProfile
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        syncTailwindDarkMode(currentTheme);

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
      const streakType = currentUser.profile?.streakType || 'Daily';
      await get().updateProfile(ageGroup, themeName, streakType);
    },

    setStreakType: async (streakType) => {
      const currentUser = get().user;
      if (!currentUser) return;
      
      const ageGroup = currentUser.profile?.ageGroup || '';
      const theme = currentUser.profile?.theme || 'Classic';
      await get().updateProfile(ageGroup, theme, streakType);
    },

    updateAccount: async (name, email, picture) => {
      set({ isLoading: true, error: null });
      try {
        const token = get().accessToken;
        const data = await profileService.updateAccount({ name, email, picture }, token);
        const updatedUser = data.user;

        localStorage.setItem('user', JSON.stringify(updatedUser));

        set({
          user: updatedUser,
          isLoading: false
        });

        return updatedUser;
      } catch (err) {
        console.error('Update account error:', err);
        const errMsg = err.response?.data?.message || 'Failed to update account details.';
        set({ error: errMsg, isLoading: false });
        throw new Error(errMsg);
      }
    },

    acknowledgePolicy: async () => {
      set({ isLoading: true, error: null });
      try {
        const token = get().accessToken;
        const data = await authService.acknowledgePolicy(token);
        const { user } = data;

        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          isLoading: false
        });
        return user;
      } catch (err) {
        console.error('Acknowledge policy error:', err);
        const errMsg = err.response?.data?.message || 'Failed to acknowledge privacy policy.';
        set({ error: errMsg, isLoading: false });
        throw new Error(errMsg);
      }
    },

    deleteAccount: async () => {
      set({ isLoading: true, error: null });
      try {
        const token = get().accessToken;
        await profileService.deleteAccount(token);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        document.documentElement.classList.remove('dark');

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error('Delete account error:', err);
        const errMsg = err.response?.data?.message || 'Failed to delete account.';
        set({ error: errMsg, isLoading: false });
        throw new Error(errMsg);
      }
    },

    refreshSession: async () => {
      const currentRefreshToken = get().refreshToken;

      try {
        const data = await authService.refreshToken(currentRefreshToken);
        const { accessToken, refreshToken } = data;

        if (localStorage.getItem('accessToken')) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }

        set({
          isAuthenticated: true
        });

        return accessToken;
      } catch (err) {
        console.error('Session refresh failed:', err);
        get().logout();
        return false;
      }
    },

    checkAuth: async () => {
      set({ isLoading: true });
      try {
        const response = await api.get('/auth/me');
        const { user } = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }
    }
  };
});
