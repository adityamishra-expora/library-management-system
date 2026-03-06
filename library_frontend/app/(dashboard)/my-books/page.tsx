'use client';

import { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { useMyTransactions } from '@/hooks/useTransactions';
import TransactionTable from '@/components/transactions/TransactionTable';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Borrowed', value: 'borrowed' },
  { label: 'Returned', value: 'returned' },
  { label: 'Overdue', value: 'overdue' },
];

export default function MyBooksPage() {
  const [activeStatus, setActiveStatus] = useState('');
  const { data, isLoading, error, page, setPage, refetch } = useMyTransactions(
    activeStatus || undefined
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookMarked className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Borrowed Books</h1>
          <p className="text-gray-500 mt-0.5">Your borrowing history</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveStatus(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
            showUser={false}
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
