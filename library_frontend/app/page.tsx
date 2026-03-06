import { redirect } from 'next/navigation';

/**
 * Root page — redirect to dashboard.
 * Auth middleware will redirect to /login if not authenticated.
 */
export default function HomePage() {
  redirect('/dashboard');
}
