'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

const navItemsByRole: Record<string, { label: string; href: string }[]> = {
  EMPLOYER: [
    { label: 'Dashboard', href: '/employer/dashboard' },
    { label: 'Post Job', href: '/employer/post' },
  ],
  SEEKER: [
    { label: 'Jobs', href: '/seeker/jobs' },
    { label: 'Profile', href: '/seeker/profile' },
    { label: 'Applications', href: '/seeker/applications' },
  ],
  ADMIN: [
    { label: 'Admin Overview', href: '/admin' },
  ],
};

const guestNav = [
  { label: 'Home', href: '/' },
  { label: 'Log In', href: '/login' },
  { label: 'Sign Up', href: '/signup' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = user ? navItemsByRole[user.role] ?? [] : guestNav;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          Agentic Jobs
        </Link>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition hover:text-slate-900 ${
                pathname === item.href ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <button
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              onClick={handleLogout}
            >
              Log out
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
};
