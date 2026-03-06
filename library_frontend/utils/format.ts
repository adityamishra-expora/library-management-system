/**
 * Formatting utility functions.
 */

import { format, formatDistanceToNow, isPast } from 'date-fns';

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

/**
 * Format a datetime string.
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, hh:mm a');
  } catch {
    return '—';
  }
}

/**
 * Return relative time string (e.g. "3 days ago").
 */
export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '—';
  }
}

/**
 * Format a currency value in INR.
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toFixed(2)}`;
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLen = 100): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

/**
 * Returns true if a due date string is in the past.
 */
export function isOverdue(dueDateStr: string): boolean {
  try {
    return isPast(new Date(dueDateStr));
  } catch {
    return false;
  }
}

/**
 * Map a transaction status to Tailwind color classes.
 */
export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    borrowed: 'bg-blue-100 text-blue-800',
    returned: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Map a user role to a display label.
 */
export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: 'Admin',
    librarian: 'Librarian',
    student: 'Student',
  };
  return map[role] || role;
}
