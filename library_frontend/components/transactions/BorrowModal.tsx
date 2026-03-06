'use client';

import { useState } from 'react';
import { X, BookOpen, Loader2, Calendar } from 'lucide-react';
import { Book } from '@/types/book.types';
import TransactionsService from '@/services/transactions.service';
import toast from 'react-hot-toast';
import { addDays, format } from 'date-fns';

interface BorrowModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BorrowModal({ book, onClose, onSuccess }: BorrowModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const dueDate = addDays(new Date(), 14);

  const handleBorrow = async () => {
    setIsLoading(true);
    try {
      await TransactionsService.borrowBook({ book_id: book.id });
      toast.success(`Successfully borrowed "${book.title}"`);
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { book_id?: string[]; non_field_errors?: string[] } } };
      const errData = apiErr?.response?.data;
      const message =
        errData?.book_id?.[0] ||
        errData?.non_field_errors?.[0] ||
        'Failed to borrow book. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Borrow Book</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Book info */}
          <div className="flex gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="w-12 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{book.title}</p>
              <p className="text-sm text-gray-500">{book.author}</p>
              <p className="text-xs text-gray-400 mt-1">ISBN: {book.isbn}</p>
            </div>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
            <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Due Date</p>
              <p className="text-sm text-amber-700 font-semibold">
                {format(dueDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">14-day loan period</p>
            </div>
          </div>

          {/* Fine notice */}
          <p className="text-xs text-gray-500 text-center">
            A fine of ₹5 per day will be charged for late returns.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleBorrow} disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Borrowing...</>
            ) : (
              'Confirm Borrow'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
