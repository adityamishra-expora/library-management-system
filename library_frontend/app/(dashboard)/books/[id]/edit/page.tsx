'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useBook } from '@/hooks/useBooks';
import { useAuth } from '@/context/AuthContext';
import BookForm from '@/components/books/BookForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useEffect } from 'react';

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookId = Number(params.id);
  const { book, isLoading } = useBook(bookId);

  // Access guard
  useEffect(() => {
    if (user && user.role === 'student') {
      router.push('/books');
    }
  }, [user, router]);

  if (!user || user.role === 'student') return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-500">Book not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/books/${bookId}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Book</h1>
      </div>

      <div className="card">
        <BookForm
          mode="edit"
          book={book}
          onSuccess={() => router.push(`/books/${bookId}`)}
        />
      </div>
    </div>
  );
}
