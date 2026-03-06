'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UsersService from '@/services/users.service';
import { User } from '@/types/auth.types';
import { PaginatedResponse } from '@/types/book.types';
import UserTable from '@/components/users/UserTable';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Only admins can access this page
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setIsLoading(true);
    UsersService.getUsers(page, search || undefined)
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, page, search]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-0.5">
            {data ? `${data.count} registered user${data.count !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : data?.results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No users found.</p>
          </div>
        ) : (
          <UserTable
            users={data?.results || []}
            onRefetch={() => {
              UsersService.getUsers(page, search || undefined).then(setData);
            }}
          />
        )}
      </div>

      {/* Pagination */}
      {data && data.count > 10 && (
        <Pagination
          count={data.count}
          currentPage={page}
          onPageChange={setPage}
          pageSize={10}
        />
      )}
    </div>
  );
}
