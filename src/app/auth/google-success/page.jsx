'use client';
// src/app/auth/google-success/page.jsx
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

function GoogleSuccessInner() {
  const params  = useSearchParams();
  const router  = useRouter();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token      = params.get('token');
    const userRaw    = params.get('user');
    const errorParam = params.get('error');

    if (errorParam || !token || !userRaw) {
      router.replace(`/auth/login?error=${errorParam || 'google_failed'}`);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      Cookies.set('token', token, { expires: 7 });
      setAuth(user, token);
      router.replace('/dashboard');
    } catch {
      router.replace('/auth/login?error=google_parse_failed');
    }
  }, [params, router, setAuth]);

  return (
    <div className="text-center">
      <Loader2 className="w-10 h-10 animate-spin text-muted mx-auto mb-4" />
      <p className="text-muted text-sm">Signing you in with Google…</p>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <Suspense fallback={
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">Loading…</p>
        </div>
      }>
        <GoogleSuccessInner />
      </Suspense>
    </div>
  );
}
