'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, BookOpen, Calendar, Hash } from 'lucide-react';
import { useBook } from '@/hooks/useBooks';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/format';
import { useState } from 'react';
import BorrowModal from '@/components/transactions/BorrowModal';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookId = Number(params.id);
  const { book, isLoading, error } = useBook(bookId);
  const [showBorrow, setShowBorrow] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-500">{error || 'Book not found.'}</p>
        <Link href="/books" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Book Details</h1>
        </div>
        {canManage && (
          <Link href={`/books/${book.id}/edit`} className="btn-secondary gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Link>
        )}
      </div>

      {/* Book detail card */}
      <div className="card space-y-6">
        {/* Title & Author */}
        <div className="flex gap-6">
          <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-10 h-10 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{book.title}</h2>
            <p className="text-gray-600 mt-1">{book.author}</p>
            {book.category_name && (
              <span className="mt-2 inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {book.category_name}
              </span>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" /> ISBN: {book.isbn}
              </span>
              {book.publication_year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {book.publication_year}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{book.total_copies}</p>
            <p className="text-xs text-gray-500 mt-1">Total Copies</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className={`text-2xl font-bold ${book.available_copies > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {book.available_copies}
            </p>
            <p className="text-xs text-gray-500 mt-1">Available</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {book.total_copies - book.available_copies}
            </p>
            <p className="text-xs text-gray-500 mt-1">Borrowed</p>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {book.publisher && (
            <div>
              <span className="text-gray-500">Publisher: </span>
              <span className="text-gray-800 font-medium">{book.publisher}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Added: </span>
            <span className="text-gray-800 font-medium">{formatDate(book.created_at)}</span>
          </div>
        </div>

        {/* Borrow button */}
        {user?.role === 'student' && (
          <button
            onClick={() => setShowBorrow(true)}
            disabled={!book.is_available}
            className={book.is_available ? 'btn-primary w-full' : 'btn-secondary w-full opacity-60 cursor-not-allowed'}
          >
            {book.is_available ? 'Borrow This Book' : 'Not Available'}
          </button>
        )}
      </div>

      {showBorrow && (
        <BorrowModal
          book={book}
          onClose={() => setShowBorrow(false)}
          onSuccess={() => setShowBorrow(false)}
        />
      )}
    </div>
  );
}
