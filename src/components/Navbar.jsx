'use client';
// src/components/Navbar.jsx
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LogOut, Search, LayoutDashboard, Heart } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar({ onSearch }) {
  const { user, isLoggedIn, clearAuth } = useAuth();
  const [q, setQ] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(q);
    else router.push(`/dashboard?q=${encodeURIComponent(q)}`);
  };

  return (
    <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="font-display text-xl text-ink shrink-0">
          Prompt<span className="text-accent">Vault</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search prompts…"
              className="w-full pl-8 pr-3 py-1.5 bg-cream border border-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Admin panel link — only for admins */}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm bg-accent text-ink px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">Admin Panel</span>
                </Link>
              )}

              {/* Liked prompts link */}
              <Link
                href="/liked"
                className="flex items-center gap-1.5 text-sm text-muted hover:text-red-500 transition-colors"
                title="Liked Prompts"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:block">Liked</span>
              </Link>

              <span className="text-sm text-muted hidden sm:block">{user?.name}</span>

              <button
                onClick={clearAuth}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-muted hover:text-ink transition-colors">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-ink text-paper px-4 py-1.5 rounded-lg hover:bg-accent-dark transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
