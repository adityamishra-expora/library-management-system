/**
 * Transaction TypeScript types.
 */

import { Book } from './book.types';
import { User } from './auth.types';

export type TransactionStatus = 'borrowed' | 'returned' | 'overdue';

export interface Transaction {
  id: number;
  book: number;
  book_title: string;
  book_author: string;
  user: number;
  user_email: string;
  user_name: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: TransactionStatus;
  fine_amount: string;
  is_overdue: boolean;
  overdue_days: number;
  created_at: string;
}

export interface TransactionDetail extends Omit<Transaction, 'book_title' | 'book_author' | 'user_email' | 'user_name'> {
  book_detail: Book;
  user_detail: User;
  notes: string | null;
  updated_at: string;
}

export interface BorrowRequest {
  book_id: number;
}

export interface ReturnRequest {
  transaction_id: number;
}

export interface BorrowResponse {
  message: string;
  transaction: TransactionDetail;
}

export interface ReturnResponse {
  message: string;
  fine_amount: number;
  transaction: TransactionDetail;
}

export interface TransactionStats {
  total_transactions: number;
  currently_borrowed: number;
  returned: number;
  overdue: number;
  total_fines_collected: number;
}
