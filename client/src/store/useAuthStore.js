import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an Axios instance with interceptors for token refresh
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Sync Tailwind dark mode class and theme class on theme change
const syncTailwindDarkMode = (themeName) => {
  const classesToRemove = ['theme-serenity', 'theme-midnight-focus', 'theme-nature', 'theme-classic', 'theme-vivekananda'];
  document.documentElement.classList.remove(...classesToRemove);

  const normalizedTheme = themeName.toLowerCase().replace(/\s+/g, '-');
  document.documentElement.classList.add(`theme-${normalizedTheme}`);

  if (themeName === 'Midnight Focus') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

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
        const response = await api.post('/auth/google', {
          credential,
          isMock,
          email,
          name,
          picture
        });

        const { accessToken, refreshToken, user, isNewUser } = response.data;

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

        // Fetch user data
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const { user } = response.data;
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
        if (currentRefreshToken) {
          await api.post('/auth/logout', { refreshToken: currentRefreshToken });
        }
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
        const response = await api.put(
          '/profile',
          { ageGroup, theme },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedProfile = response.data.profile;
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

    // Token refresh helper
    refreshSession: async () => {
      const currentRefreshToken = get().refreshToken;
      if (!currentRefreshToken) return false;

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: currentRefreshToken
        });

        const { accessToken, refreshToken } = response.data;

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
        // Force logout on failure
        get().logout();
        return false;
      }
    }
  };
});

// Configure Axios request interceptor to inject Authorization header
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Configure Axios response interceptor to handle 401s and refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const newAccessToken = await useAuthStore.getState().refreshSession();
      if (newAccessToken) {
        // Update header and retry request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);
