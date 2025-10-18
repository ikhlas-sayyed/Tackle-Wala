import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, User } from '../../lib/api-client';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,

      login: async (email: string, password: string, isAdmin = false) => {
        set({ isLoading: true });
        try {
          const response = isAdmin 
            ? await apiClient.adminLogin(email, password)
            : await apiClient.customerLogin(email, password);

          if (response.success && response.data) {
            apiClient.setToken(response.data.token);
            set({ 
              user: response.data.user, 
              isLoading: false,
              isInitialized: true 
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.customerRegister(data);
          
          if (response.success && response.data) {
            apiClient.setToken(response.data.token);
            set({ 
              user: response.data.user, 
              isLoading: false,
              isInitialized: true 
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        apiClient.clearToken();
        set({ 
          user: null, 
          isLoading: false,
          isInitialized: true 
        });
      },

      checkAuth: async () => {
        const token = apiClient.getToken();
        if (!token) {
          set({ isLoading: false, isInitialized: true });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isLoading: false,
              isInitialized: true 
            });
          } else {
            apiClient.clearToken();
            set({ 
              user: null, 
              isLoading: false,
              isInitialized: true 
            });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          apiClient.clearToken();
          set({ 
            user: null, 
            isLoading: false,
            isInitialized: true 
          });
        }
      },

      setUser: (user) => set({ user }),

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);