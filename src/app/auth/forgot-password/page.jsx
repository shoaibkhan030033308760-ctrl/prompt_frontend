'use client';
// src/app/auth/forgot-password/page.jsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forgotPassword, resetPassword } from '@/lib/api';
import { Loader2, Mail, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step,     setStep]     = useState('email'); // 'email' | 'reset'
  const [email,    setEmail]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSuccess(data.message);
      setStep('reset');
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, password);
      router.push('/auth/login?reset=1');
    } catch (err) {
      setError(err?.response?.data?.error || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="font-display text-3xl text-ink">
            Prompt<span className="text-accent">Vault</span>
          </Link>
          <p className="text-muted text-sm mt-2">
            {step === 'email' ? 'Reset your password' : 'Enter the code sent to your email'}
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {success && step === 'reset' && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              {success}
            </div>
          )}

          {/* Step 1: Enter email */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="flex flex-col items-center py-4 gap-3">
                <div className="w-14 h-14 rounded-full bg-cream border border-border flex items-center justify-center">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm text-muted text-center">
                  Enter your email and we&apos;ll send you a reset code.
                </p>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-2.5 rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending…' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP + new password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="flex flex-col items-center py-2 gap-2">
                <div className="w-14 h-14 rounded-full bg-cream border border-border flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm text-muted text-center">
                  Code sent to <strong className="text-ink">{email}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
                  Reset Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink text-center tracking-widest font-medium focus:outline-none focus:border-accent transition-colors"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                  placeholder="Min 8 characters"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-2.5 rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setSuccess(''); setOtp(''); }}
                className="w-full text-center text-muted text-sm hover:text-ink transition-colors"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-muted text-sm mt-5">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
