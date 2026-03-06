/**
 * Book and Category TypeScript types.
 */

export interface Category {
  id: number;
  name: string;
  description: string | null;
  book_count: number;
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: number | null;
  category_name: string | null;
  description: string | null;
  publisher: string | null;
  publication_year: number | null;
  cover_image: string | null;
  total_copies: number;
  available_copies: number;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BookCreateRequest {
  title: string;
  author: string;
  isbn: string;
  category?: number | null;
  description?: string;
  publisher?: string;
  publication_year?: number | null;
  total_copies: number;
}

export interface BookFilters {
  search?: string;
  category?: number;
  available_only?: boolean;
  page?: number;
  ordering?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
