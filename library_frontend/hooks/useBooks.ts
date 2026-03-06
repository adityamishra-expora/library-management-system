'use client';

/**
 * Custom hook for book data fetching with loading/error states.
 */

import { useState, useEffect, useCallback } from 'react';
import BooksService from '@/services/books.service';
import { Book, BookFilters, Category, PaginatedResponse } from '@/types/book.types';
import toast from 'react-hot-toast';

export function useBooks(initialFilters: BookFilters = {}) {
  const [data, setData] = useState<PaginatedResponse<Book> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookFilters>(initialFilters);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await BooksService.getBooks(filters);
      setData(result);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to load books.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const updateFilters = (newFilters: Partial<BookFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return { data, isLoading, error, filters, updateFilters, setPage, refetch: fetchBooks };
}

export function useBook(id: number | null) {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const result = await BooksService.getBook(id);
      setBook(result);
    } catch {
      setError('Failed to load book details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  return { book, isLoading, error, refetch: fetchBook };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    BooksService.getCategories()
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories.'))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}
