'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBooks, useCategories } from '@/hooks/useBooks';
import BookCard from '@/components/books/BookCard';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BorrowModal from '@/components/transactions/BorrowModal';
import { Book } from '@/types/book.types';

export default function BooksPage() {
  const { user } = useAuth();
  const { data, isLoading, error, filters, updateFilters, setPage } = useBooks();
  const { categories } = useCategories();
  const [borrowBook, setBorrowBook] = useState<Book | null>(null);

  const canManageBooks = user?.role === 'admin' || user?.role === 'librarian';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-500 mt-1">
            {data ? `${data.count} book${data.count !== 1 ? 's' : ''} in the library` : ''}
          </p>
        </div>
        {canManageBooks && (
          <Link href="/books/add" className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Add Book
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="input-field pl-9"
            />
          </div>

          {/* Category filter */}
          <select
            value={filters.category || ''}
            onChange={(e) => updateFilters({ category: e.target.value ? Number(e.target.value) : undefined })}
            className="input-field sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Available only toggle */}
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.available_only}
              onChange={(e) => updateFilters({ available_only: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            Available only
          </label>
        </div>
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : data?.results.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">No books found.</p>
          {canManageBooks && (
            <Link href="/books/add" className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4 mr-2" /> Add the first book
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.results.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrow={() => setBorrowBook(book)}
                canManage={canManageBooks}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && (
            <Pagination
              count={data.count}
              currentPage={filters.page || 1}
              onPageChange={setPage}
              pageSize={10}
            />
          )}
        </>
      )}

      {/* Borrow Modal */}
      {borrowBook && (
        <BorrowModal
          book={borrowBook}
          onClose={() => setBorrowBook(null)}
          onSuccess={() => {
            setBorrowBook(null);
          }}
        />
      )}
    </div>
  );
}
