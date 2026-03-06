'use client';

import { useState } from 'react';
import { Loader2, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { User, UserRole } from '@/types/auth.types';
import { formatDate, roleLabel } from '@/utils/format';
import UsersService from '@/services/users.service';
import toast from 'react-hot-toast';

interface UserTableProps {
  users: User[];
  onRefetch: () => void;
}

export default function UserTable({ users, onRefetch }: UserTableProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleToggleStatus = async (user: User) => {
    setLoadingId(user.id);
    try {
      const result = await UsersService.toggleUserStatus(user.id);
      toast.success(result.message);
      onRefetch();
    } catch {
      toast.error('Failed to update user status.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    setLoadingId(user.id);
    try {
      const result = await UsersService.updateUserRole(user.id, newRole);
      toast.success(result.message);
      onRefetch();
    } catch {
      toast.error('Failed to update user role.');
    } finally {
      setLoadingId(null);
    }
  };

  const roleBadgeClass = (role: string) => {
    const map: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      librarian: 'bg-amber-100 text-amber-700',
      student: 'bg-blue-100 text-blue-700',
    };
    return map[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              {/* User info */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-semibold text-xs">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-4 py-3">
                <span className={`badge ${roleBadgeClass(user.role)}`}>
                  {roleLabel(user.role)}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span className={`badge ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>

              {/* Joined */}
              <td className="px-4 py-3 text-gray-500">{formatDate(user.date_joined)}</td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {/* Toggle status */}
                  <button
                    onClick={() => handleToggleStatus(user)}
                    disabled={loadingId === user.id}
                    title={user.is_active ? 'Deactivate' : 'Activate'}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {loadingId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : user.is_active ? (
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Role change */}
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                    disabled={loadingId === user.id}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="librarian">Librarian</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
