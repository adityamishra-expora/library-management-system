/**
 * Authentication Service.
 * Wraps all auth-related API calls.
 */

import api, { setTokens, clearTokens } from './api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ChangePasswordRequest,
} from '@/types/auth.types';

const AuthService = {
  /**
   * Login with email/password. Stores tokens in cookies.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login/', credentials);
    setTokens(data.access, data.refresh);
    return data;
  },

  /**
   * Register a new user account.
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>('/auth/register/', payload);
    setTokens(data.tokens.access, data.tokens.refresh);
    return data;
  },

  /**
   * Logout and blacklist refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/auth/logout/', { refresh: refreshToken });
    } finally {
      clearTokens();
    }
  },

  /**
   * Get the current user's profile.
   */
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/auth/profile/');
    return data;
  },

  /**
   * Update current user's profile.
   */
  async updateProfile(payload: Partial<Pick<User, 'first_name' | 'last_name' | 'phone'>>): Promise<User> {
    const { data } = await api.patch<User>('/auth/profile/', payload);
    return data;
  },

  /**
   * Change user's password.
   */
  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await api.put('/auth/change-password/', payload);
  },
};

export default AuthService;
