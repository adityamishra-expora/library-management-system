'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAllTransactions } from '@/hooks/useTransactions';
import TransactionTable from '@/components/transactions/TransactionTable';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Borrowed', value: 'borrowed' },
  { label: 'Returned', value: 'returned' },
  { label: 'Overdue', value: 'overdue' },
];

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, error, page, setPage, refetch } = useAllTransactions({
    status: activeStatus || undefined,
    search: search || undefined,
  });

  useEffect(() => {
    if (user && user.role === 'student') {
      router.push('/my-books');
    }
  }, [user, router]);

  if (!user || user.role === 'student') return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookCheck className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-500 mt-0.5">
            {data ? `${data.count} transaction${data.count !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user email, book title or ISBN..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveStatus(tab.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeStatus === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : data?.results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No transactions found.</p>
          </div>
        ) : (
          <TransactionTable
            transactions={data?.results || []}
            showUser={true}
            onRefetch={refetch}
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
