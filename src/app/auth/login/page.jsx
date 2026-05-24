'use client';
// src/app/auth/login/page.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const GOOGLE_ERRORS = {
  google_no_code:      'Google sign-in was cancelled.',
  google_token_failed: 'Could not get Google token. Please try again.',
  google_user_failed:  'Could not fetch your Google profile. Please try again.',
  google_failed:       'Google sign-in failed. Please try again.',
  google_parse_failed: 'An unexpected error occurred. Please try again.',
};

export default function LoginPage() {
  const router      = useRouter();
  const params      = useSearchParams();
  const { setAuth } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [notice,   setNotice]   = useState('');

  useEffect(() => {
    if (params.get('verified') === '1') setNotice('Email verified! You can now sign in.');
    if (params.get('reset')    === '1') setNotice('Password reset! You can now sign in with your new password.');
    const errParam = params.get('error');
    if (errParam) setError(GOOGLE_ERRORS[errParam] || 'Sign-in failed. Please try again.');
  }, [params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await login(email, password);
      setAuth(user, token);
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth — redirect to backend which handles the flow
  const BACKEND = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
  const googleUrl = `${BACKEND}/api/auth/google`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="font-display text-3xl text-ink">
            Prompt<span className="text-accent">Vault</span>
          </Link>
          <p className="text-muted text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
          {notice && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              {notice}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted uppercase tracking-wide">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-3 pr-10 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-2.5 rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted text-xs">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <a
              href={googleUrl}
              className="w-full flex items-center justify-center gap-2 border border-border bg-cream text-ink text-sm font-medium py-2.5 rounded-lg hover:bg-border transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>
        </div>

        <p className="text-center text-muted text-sm mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-accent font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
