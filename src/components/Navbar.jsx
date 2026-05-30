'use client';
// src/components/Navbar.jsx
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LogOut, Search, LayoutDashboard, Heart, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar({ onSearch }) {
  const { user, isLoggedIn, clearAuth } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [q,        setQ]        = useState('');
  const [focused,  setFocused]  = useState(false);
  const inputRef = useRef(null);

  // Sync q with URL param when on dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQ   = params.get('q') || '';
    setQ(urlQ);
  }, [pathname]);

  const submitSearch = (val) => {
    const trimmed = val.trim();
    if (onSearch) {
      onSearch(trimmed);
    } else {
      if (trimmed) router.push(`/dashboard?q=${encodeURIComponent(trimmed)}`);
      else router.push('/dashboard');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch(q);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setQ('');
      submitSearch('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQ('');
    submitSearch('');
    inputRef.current?.focus();
  };

  return (
    <nav className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link href="/dashboard" className="font-display text-xl text-ink shrink-0">
          Prompt<span className="text-accent">Vault</span>
        </Link>

        {/* Search bar */}
        <div className={`flex-1 max-w-sm relative transition-all duration-200 ${focused ? 'max-w-md' : ''}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search prompts… (Enter)"
            className="w-full pl-8 pr-8 py-1.5 bg-cream border border-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:bg-white transition-colors"
          />
          {q && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 text-sm bg-accent text-ink px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              <Link
                href="/liked"
                className="flex items-center gap-1 text-muted hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                title="Liked Prompts"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:block text-sm">Liked</span>
              </Link>

              <span className="text-sm text-muted hidden md:block max-w-[100px] truncate">{user?.name}</span>

              <button
                onClick={clearAuth}
                className="flex items-center gap-1 text-muted hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-cream"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block text-sm">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-muted hover:text-ink transition-colors px-2 py-1.5">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-ink text-paper px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
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
