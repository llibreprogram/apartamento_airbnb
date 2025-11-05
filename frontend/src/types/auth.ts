export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'owner';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface AuthError {
  message: string;
  statusCode: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
}
