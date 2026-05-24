'use client';
// src/app/auth/register/page.jsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register, verifyOtp } from '@/lib/api';
import { Loader2, Mail } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      setStep('otp');
      setSuccess('OTP sent to your email. Check your inbox!');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      router.push('/auth/login?verified=1');
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="font-display text-3xl text-ink">
            Prompt<span className="text-accent">Vault</span>
          </Link>
          <p className="text-muted text-sm mt-2">
            {step === 'form' ? 'Create your free account' : 'Verify your email'}
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl shadow-sm p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              {success}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Email</label>
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
                <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Password</label>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-2.5 rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending OTP…' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex flex-col items-center py-4 gap-3">
                <div className="w-14 h-14 rounded-full bg-cream border border-border flex items-center justify-center">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm text-muted text-center">
                  Enter the 6-digit code sent to <strong className="text-ink">{email}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
                  OTP Code
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

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-2.5 rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('form'); setError(''); setSuccess(''); }}
                className="w-full text-center text-muted text-sm hover:text-ink transition-colors"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-muted text-sm mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
