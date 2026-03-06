'use client';

import { BookOpen, Users, BookMarked, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTransactionStats } from '@/hooks/useTransactions';
import { useBooks } from '@/hooks/useBooks';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/utils/format';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useTransactionStats();
  const { data: booksData, isLoading: booksLoading } = useBooks({ page: 1 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-500 mt-1 capitalize">{user?.role} Dashboard</p>
      </div>

      {/* Stats Grid */}
      {statsLoading || booksLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Books"
            value={booksData?.count ?? '—'}
            icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
            subtitle="In the library"
          />
          <StatCard
            title="Currently Borrowed"
            value={stats?.currently_borrowed ?? '—'}
            icon={<BookMarked className="w-6 h-6 text-indigo-600" />}
            color="bg-indigo-50"
            subtitle="Active borrows"
          />
          <StatCard
            title="Overdue Books"
            value={stats?.overdue ?? '—'}
            icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
            color="bg-red-50"
            subtitle="Needs attention"
          />
          <StatCard
            title="Total Fines"
            value={stats ? formatCurrency(stats.total_fines_collected) : '—'}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
            subtitle="Collected to date"
          />
        </div>
      )}

      {/* Quick summary */}
      {stats && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Total Transactions', value: stats.total_transactions },
              { label: 'Borrowed', value: stats.currently_borrowed },
              { label: 'Returned', value: stats.returned },
              { label: 'Overdue', value: stats.overdue },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
