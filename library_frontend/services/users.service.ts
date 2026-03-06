/**
 * Users Service.
 * Wraps admin user management API calls.
 */

import api from './api';
import { User, UserRole } from '@/types/auth.types';
import { PaginatedResponse } from '@/types/book.types';

const UsersService = {
  /**
   * Get paginated list of all users (admin only).
   */
  async getUsers(page = 1, search?: string): Promise<PaginatedResponse<User>> {
    const params: Record<string, unknown> = { page };
    if (search) params.search = search;
    const { data } = await api.get<PaginatedResponse<User>>('/auth/users/', { params });
    return data;
  },

  /**
   * Get a specific user by ID (admin only).
   */
  async getUser(id: number): Promise<User> {
    const { data } = await api.get<User>(`/auth/users/${id}/`);
    return data;
  },

  /**
   * Toggle user active status (admin only).
   */
  async toggleUserStatus(id: number): Promise<{ message: string; is_active: boolean }> {
    const { data } = await api.patch(`/auth/users/${id}/toggle-status/`);
    return data;
  },

  /**
   * Update user role (admin only).
   */
  async updateUserRole(id: number, role: UserRole): Promise<{ message: string; role: UserRole }> {
    const { data } = await api.patch(`/auth/users/${id}/update-role/`, { role });
    return data;
  },
};

export default UsersService;
