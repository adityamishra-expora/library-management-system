/**
 * Zod validation schemas for all forms.
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(100),
    last_name: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    role: z.enum(['admin', 'librarian', 'student']).default('student'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  isbn: z
    .string()
    .min(10, 'ISBN must be 10 or 13 digits')
    .max(17, 'ISBN is too long')
    .regex(/^[\d-]+$/, 'ISBN must contain only digits and dashes'),
  category: z.number().nullable().optional(),
  description: z.string().optional(),
  publisher: z.string().optional(),
  publication_year: z
    .number()
    .min(1000, 'Invalid year')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .nullable()
    .optional(),
  total_copies: z
    .number({ invalid_type_error: 'Must be a number' })
    .min(1, 'Must have at least 1 copy'),
});

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_new_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'Passwords do not match',
    path: ['confirm_new_password'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BookFormData = z.infer<typeof bookSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
