import Link from 'next/link';
import { BookOpen, Edit, Eye } from 'lucide-react';
import { Book } from '@/types/book.types';
import { truncate } from '@/utils/format';

interface BookCardProps {
  book: Book;
  onBorrow?: () => void;
  canManage?: boolean;
}

export default function BookCard({ book, onBorrow, canManage }: BookCardProps) {
  return (
    <div className="card flex flex-col hover:shadow-md transition-shadow duration-200 p-0 overflow-hidden">
      {/* Cover area */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-blue-400" />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
            {truncate(book.title, 60)}
          </h3>
          <p className="text-xs text-gray-500">{book.author}</p>
          {book.category_name && (
            <span className="mt-2 inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {book.category_name}
            </span>
          )}
        </div>

        {/* Availability badge */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`badge ${
              book.available_copies > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {book.available_copies > 0
              ? `${book.available_copies} available`
              : 'Unavailable'}
          </span>
          <span className="text-xs text-gray-400">{book.total_copies} total</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Link
            href={`/books/${book.id}`}
            className="flex-1 btn-secondary py-1.5 text-xs gap-1 justify-center"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </Link>

          {canManage ? (
            <Link
              href={`/books/${book.id}/edit`}
              className="flex-1 btn-secondary py-1.5 text-xs gap-1 justify-center"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>
          ) : (
            <button
              onClick={onBorrow}
              disabled={!book.is_available}
              className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                book.is_available
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Borrow
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
