/**
 * Books Service.
 * Wraps all book and category related API calls.
 */

import api from './api';
import { Book, BookCreateRequest, BookFilters, Category, PaginatedResponse } from '@/types/book.types';

const BooksService = {
  /**
   * Fetch paginated/filtered list of books.
   */
  async getBooks(filters: BookFilters = {}): Promise<PaginatedResponse<Book>> {
    const params: Record<string, unknown> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.available_only) params.available_only = true;
    if (filters.page) params.page = filters.page;
    if (filters.ordering) params.ordering = filters.ordering;

    const { data } = await api.get<PaginatedResponse<Book>>('/books/', { params });
    return data;
  },

  /**
   * Fetch a single book by ID.
   */
  async getBook(id: number): Promise<Book> {
    const { data } = await api.get<Book>(`/books/${id}/`);
    return data;
  },

  /**
   * Create a new book (librarian/admin only).
   */
  async createBook(payload: BookCreateRequest): Promise<Book> {
    const formData = buildFormData(payload as unknown as Record<string, unknown>);
    const { data } = await api.post<Book>('/books/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Update an existing book (librarian/admin only).
   */
  async updateBook(id: number, payload: Partial<BookCreateRequest>): Promise<Book> {
    const formData = buildFormData(payload as unknown as Record<string, unknown>);
    const { data } = await api.patch<Book>(`/books/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Delete a book (librarian/admin only).
   */
  async deleteBook(id: number): Promise<void> {
    await api.delete(`/books/${id}/`);
  },

  /**
   * Get all categories.
   */
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<PaginatedResponse<Category>>('/categories/');
    return data.results;
  },

  /**
   * Create a category.
   */
  async createCategory(name: string, description?: string): Promise<Category> {
    const { data } = await api.post<Category>('/categories/', { name, description });
    return data;
  },
};

/**
 * Build FormData from a plain object (supports file fields).
 */
function buildFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
}

export default BooksService;
