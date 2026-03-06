/**
 * Transactions Service.
 * Wraps all borrow/return/history API calls.
 */

import api from './api';
import {
  Transaction,
  BorrowRequest,
  BorrowResponse,
  ReturnRequest,
  ReturnResponse,
  TransactionStats,
} from '@/types/transaction.types';
import { PaginatedResponse } from '@/types/book.types';

const TransactionsService = {
  /**
   * Borrow a book.
   */
  async borrowBook(payload: BorrowRequest): Promise<BorrowResponse> {
    const { data } = await api.post<BorrowResponse>('/borrow/', payload);
    return data;
  },

  /**
   * Return a borrowed book.
   */
  async returnBook(payload: ReturnRequest): Promise<ReturnResponse> {
    const { data } = await api.post<ReturnResponse>('/return/', payload);
    return data;
  },

  /**
   * Get the current user's transaction history.
   */
  async getMyTransactions(status?: string, page = 1): Promise<PaginatedResponse<Transaction>> {
    const params: Record<string, unknown> = { page };
    if (status) params.status = status;
    const { data } = await api.get<PaginatedResponse<Transaction>>('/my-transactions/', { params });
    return data;
  },

  /**
   * Get all transactions (librarian/admin only).
   */
  async getAllTransactions(
    filters: { status?: string; page?: number; search?: string } = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const params: Record<string, unknown> = { page: filters.page || 1 };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    const { data } = await api.get<PaginatedResponse<Transaction>>('/transactions/', { params });
    return data;
  },

  /**
   * Get overdue transactions (librarian/admin only).
   */
  async getOverdueTransactions(): Promise<PaginatedResponse<Transaction>> {
    const { data } = await api.get<PaginatedResponse<Transaction>>('/transactions/overdue/');
    return data;
  },

  /**
   * Get borrowing statistics (admin only).
   */
  async getStats(): Promise<TransactionStats> {
    const { data } = await api.get<TransactionStats>('/transactions/stats/');
    return data;
  },
};

export default TransactionsService;
