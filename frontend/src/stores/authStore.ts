import { create, StoreApi } from 'zustand';
import { LoginRequest, LoginResponse, RegisterRequest, AuthState, AuthError } from '@/types/auth';
import { apiClient } from '@/services/api';

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthStore>((set: any) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      const { access_token, user } = response.data;

      // Guardar token y usuario en localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login fallido';
      const error: AuthError = {
        message: errorMessage,
        statusCode: err.response?.status || 500,
      };
      set({
        error,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/register', data);
      
      // Después de registrar, hacer login automático
      await (useAuthStore.getState() as any).login({
        email: data.email,
        password: data.password,
      });

      set({ isLoading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registro fallido';
      const error: AuthError = {
        message: errorMessage,
        statusCode: err.response?.status || 500,
      };
      set({
        error,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  restoreSession: () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (err) {
        console.error('Error restaurando sesión:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  },
}));
