'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { bookSchema, BookFormData } from '@/utils/validation';
import { Book } from '@/types/book.types';
import { useCategories } from '@/hooks/useBooks';
import BooksService from '@/services/books.service';
import toast from 'react-hot-toast';

interface BookFormProps {
  mode: 'create' | 'edit';
  book?: Book;
  onSuccess: () => void;
}

export default function BookForm({ mode, book, onSuccess }: BookFormProps) {
  const { categories } = useCategories();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: book
      ? {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          category: book.category ?? undefined,
          description: book.description ?? '',
          publisher: book.publisher ?? '',
          publication_year: book.publication_year ?? undefined,
          total_copies: book.total_copies,
        }
      : { total_copies: 1 },
  });

  const onSubmit = async (data: BookFormData) => {
    try {
      if (mode === 'create') {
        await BooksService.createBook(data);
        toast.success('Book added successfully!');
      } else if (book) {
        await BooksService.updateBook(book.id, data);
        toast.success('Book updated successfully!');
      }
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: Record<string, string[]> } };
      const errData = apiErr?.response?.data;
      if (errData) {
        const key = Object.keys(errData)[0];
        toast.error(`${key}: ${errData[key][0]}`);
      } else {
        toast.error('Failed to save book. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input {...register('title')} className="input-field" placeholder="Book title" />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
        <input {...register('author')} className="input-field" placeholder="Author name" />
        {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author.message}</p>}
      </div>

      {/* ISBN & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
          <input {...register('isbn')} className="input-field" placeholder="978-3-16-148410-0" />
          {errors.isbn && <p className="mt-1 text-xs text-red-500">{errors.isbn.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select {...register('category', { setValueAs: (v) => v === '' ? null : Number(v) })} className="input-field">
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Publisher & Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
          <input {...register('publisher')} className="input-field" placeholder="Publisher name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
          <input
            {...register('publication_year', { setValueAs: (v) => v === '' ? null : Number(v) })}
            type="number"
            className="input-field"
            placeholder="2024"
          />
          {errors.publication_year && (
            <p className="mt-1 text-xs text-red-500">{errors.publication_year.message}</p>
          )}
        </div>
      </div>

      {/* Total copies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
        <input
          {...register('total_copies', { valueAsNumber: true })}
          type="number"
          min={1}
          className="input-field"
        />
        {errors.total_copies && (
          <p className="mt-1 text-xs text-red-500">{errors.total_copies.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="input-field resize-none"
          placeholder="Brief description of the book..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : mode === 'create' ? 'Add Book' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
