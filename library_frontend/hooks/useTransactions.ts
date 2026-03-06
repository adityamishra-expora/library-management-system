'use client';

/**
 * Custom hook for transaction data fetching.
 */

import { useState, useEffect, useCallback } from 'react';
import TransactionsService from '@/services/transactions.service';
import { Transaction, TransactionStats } from '@/types/transaction.types';
import { PaginatedResponse } from '@/types/book.types';

export function useMyTransactions(statusFilter?: string) {
  const [data, setData] = useState<PaginatedResponse<Transaction> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await TransactionsService.getMyTransactions(statusFilter, page);
      setData(result);
    } catch {
      setError('Failed to load your borrowing history.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { data, isLoading, error, page, setPage, refetch: fetchTransactions };
}

export function useAllTransactions(filters: { status?: string; search?: string } = {}) {
  const [data, setData] = useState<PaginatedResponse<Transaction> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await TransactionsService.getAllTransactions({ ...filters, page });
      setData(result);
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.search, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { data, isLoading, error, page, setPage, refetch: fetchTransactions };
}

export function useTransactionStats() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    TransactionsService.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}
