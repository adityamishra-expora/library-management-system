'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import BookForm from '@/components/books/BookForm';
import { useEffect } from 'react';

export default function AddBookPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Only librarian/admin can access this page
  useEffect(() => {
    if (user && user.role === 'student') {
      router.push('/books');
    }
  }, [user, router]);

  if (!user || user.role === 'student') return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/books" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Book</h1>
      </div>

      <div className="card">
        <BookForm mode="create" onSuccess={() => router.push('/books')} />
      </div>
    </div>
  );
}
