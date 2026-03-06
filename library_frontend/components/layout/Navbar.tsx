'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/** Maps pathnames to human-readable page titles */
function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/books': 'Books',
    '/my-books': 'My Borrowed Books',
    '/users': 'User Management',
    '/transactions': 'All Transactions',
  };

  for (const [key, title] of Object.entries(map)) {
    if (pathname.startsWith(key)) return title;
  }
  return 'Library Management';
}

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900 lg:block hidden">
        {getPageTitle(pathname)}
      </h2>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell (decorative) */}
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
          <Bell className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-semibold text-sm">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
