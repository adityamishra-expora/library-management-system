'use client';

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { Transaction } from '@/types/transaction.types';
import { formatDate, formatCurrency, statusBadgeClass } from '@/utils/format';
import TransactionsService from '@/services/transactions.service';
import toast from 'react-hot-toast';

interface TransactionTableProps {
  transactions: Transaction[];
  showUser?: boolean;
  onRefetch?: () => void;
}

export default function TransactionTable({
  transactions,
  showUser = true,
  onRefetch,
}: TransactionTableProps) {
  const [returningId, setReturningId] = useState<number | null>(null);

  const handleReturn = async (txn: Transaction) => {
    setReturningId(txn.id);
    try {
      const result = await TransactionsService.returnBook({ transaction_id: txn.id });
      const fine = result.fine_amount;
      if (fine > 0) {
        toast.success(`Returned! Fine of ${formatCurrency(fine)} has been recorded.`);
      } else {
        toast.success(`"${txn.book_title}" returned successfully!`);
      }
      onRefetch?.();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } };
      toast.error(apiErr?.response?.data?.detail || 'Failed to return book.');
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Book</th>
            {showUser && (
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
            )}
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Return Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fine</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((txn) => (
            <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
              {/* Book */}
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{txn.book_title}</p>
                <p className="text-xs text-gray-400">{txn.book_author}</p>
              </td>

              {/* User */}
              {showUser && (
                <td className="px-4 py-3">
                  <p className="text-gray-700">{txn.user_name}</p>
                  <p className="text-xs text-gray-400">{txn.user_email}</p>
                </td>
              )}

              {/* Dates */}
              <td className="px-4 py-3 text-gray-600">{formatDate(txn.issue_date)}</td>
              <td className="px-4 py-3">
                <span className={txn.is_overdue && txn.status !== 'returned' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  {formatDate(txn.due_date)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {txn.return_date ? formatDate(txn.return_date) : '—'}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span className={`badge ${statusBadgeClass(txn.status)}`}>
                  {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                </span>
                {txn.overdue_days > 0 && txn.status !== 'returned' && (
                  <p className="text-xs text-red-500 mt-0.5">{txn.overdue_days}d overdue</p>
                )}
              </td>

              {/* Fine */}
              <td className="px-4 py-3">
                <span className={parseFloat(txn.fine_amount) > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                  {parseFloat(txn.fine_amount) > 0 ? formatCurrency(txn.fine_amount) : '₹0'}
                </span>
              </td>

              {/* Action */}
              <td className="px-4 py-3">
                {txn.status !== 'returned' && (
                  <button
                    onClick={() => handleReturn(txn)}
                    disabled={returningId === txn.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {returningId === txn.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    Return
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
