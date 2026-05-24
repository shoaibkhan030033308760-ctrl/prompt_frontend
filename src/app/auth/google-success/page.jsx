'use client';
// src/app/auth/google-success/page.jsx
// Google OAuth callback landing page.
// Backend redirects here with ?token=...&user=...
// We store the token in cookie + user in localStorage, then redirect to dashboard.

import { useEffect } from 'react';
import {  useRouter } from 'next/navigation';
// useSearchParams,
import Cookies from 'js-cookie';
import { useAuth } from '@/lib/auth-context';

export default function GoogleSuccessPage({ searchParams }) {
  const params = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuth();

  useEffect(() => {
    // const token    = params.get('token');
    // const userRaw  = params.get('user');
    // const errorParam = params.get('error');
  const token = searchParams.token;
  const userRaw = searchParams.user;
  const errorParam = searchParams.error;

    if (errorParam || !token || !userRaw) {
      // OAuth failed — go back to login with error
      router.replace(`/auth/login?error=${errorParam || 'google_failed'}`);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      // Store token in cookie (same as email/password login)
      Cookies.set('token', token, { expires: 7 });
      // Update auth context + localStorage
      setAuth(user, token);
      // Clean redirect — no token in URL
      router.replace('/dashboard');
    } catch {
      router.replace('/auth/login?error=google_parse_failed');
    }
  }, [params, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}
