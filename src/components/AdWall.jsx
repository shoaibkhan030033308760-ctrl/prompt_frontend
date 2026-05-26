'use client';
// src/components/AdWall.jsx
// Monetag redirect-based ad flow:
// 1. User clicks "Watch Ad" → new tab opens with Monetag ad link
// 2. A timer runs (30s) — after that "I watched the ad" button activates
// 3. User clicks confirm → backend marks adWatched = true → prompt unlocks
import { useEffect, useState, useRef } from 'react';
import { markAdWatched, markGuestAdWatched } from '@/lib/api';
import { Lock, ExternalLink, CheckCircle, Loader2, Clock } from 'lucide-react';

const AD_URL = 'https://omg10.com/4/11059140';
const WAIT_SECONDS = 5; // seconds user must wait before confirming

export default function AdWall({ imageUrl, onUnlocked, onClose, isGuest = false }) {
  // states: 'idle' | 'waiting' | 'ready' | 'confirming' | 'done' | 'error'
  const [phase,     setPhase]     = useState('idle');
  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const timerRef = useRef(null);

  // Start countdown after ad tab opens
  const handleWatchAd = () => {
    // Open ad in new tab
    window.open(AD_URL, '_blank', 'noopener');
    setPhase('waiting');
    setCountdown(WAIT_SECONDS);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // User confirms they watched the ad
  const handleConfirm = async () => {
    setPhase('confirming');
    try {
      if (isGuest) {
        await markGuestAdWatched();
      } else {
        await markAdWatched();
      }
      setPhase('done');
      setTimeout(onUnlocked, 800);
    } catch {
      setPhase('error');
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-paper rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-ink px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent" />
            <span className="font-display text-paper text-lg">Unlock Prompt</span>
          </div>
          {phase === 'idle' && (
            <button
              onClick={onClose}
              className="text-muted hover:text-paper transition-colors text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-8 text-center">

          {/* IDLE — prompt user to open ad */}
          {phase === 'idle' && (
            <>
              <div className="w-16 h-16 rounded-full bg-cream border-2 border-border flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-2xl text-ink mb-2">Watch a Short Ad</h3>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Click below to open a short sponsored page. After <strong>30 seconds</strong>, come back here and confirm to unlock the prompt.
              </p>
              <button
                onClick={handleWatchAd}
                className="w-full flex items-center justify-center gap-2 bg-ink text-paper font-medium py-3 px-6 rounded-xl hover:bg-accent-dark transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Ad &amp; Start Timer
              </button>
            </>
          )}

          {/* WAITING — countdown running */}
          {phase === 'waiting' && (
            <>
              <div className="w-20 h-20 rounded-full bg-cream border-2 border-accent flex items-center justify-center mx-auto mb-5">
                <span className="font-display text-3xl text-accent">{countdown}</span>
              </div>
              <h3 className="font-display text-xl text-ink mb-2">Ad is Open</h3>
              <p className="text-muted text-sm mb-4 leading-relaxed">
                Please stay on the ad page. Come back here once the timer hits zero.
              </p>
              <div className="flex items-center justify-center gap-2 text-muted text-sm">
                <Clock className="w-4 h-4" />
                <span>Wait {countdown}s before confirming…</span>
              </div>
              {/* Allow re-opening ad if user closed it accidentally */}
              <button
                onClick={() => window.open(AD_URL, '_blank', 'noopener')}
                className="mt-4 text-accent text-xs hover:underline"
              >
                Re-open ad tab
              </button>
            </>
          )}

          {/* READY — timer done, user can confirm */}
          {phase === 'ready' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-display text-xl text-ink mb-2">Timer Complete!</h3>
              <p className="text-muted text-sm mb-6">
                Thanks for watching. Click below to unlock your prompt.
              </p>
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                I Watched — Unlock Prompt
              </button>
            </>
          )}

          {/* CONFIRMING — calling backend */}
          {phase === 'confirming' && (
            <>
              <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
              <p className="text-ink font-medium">Unlocking…</p>
            </>
          )}

          {/* DONE */}
          {phase === 'done' && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-display text-xl text-ink">Unlocked!</p>
              <p className="text-muted text-sm mt-1">Revealing the prompt…</p>
            </>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <>
              <p className="text-ink font-medium mb-3">Something went wrong.</p>
              <button
                onClick={handleConfirm}
                className="text-accent hover:underline text-sm"
              >
                Try again
              </button>
            </>
          )}

        </div>

        {/* Footer note */}
        {(phase === 'idle' || phase === 'waiting') && (
          <div className="px-6 pb-5">
            <p className="text-muted text-xs text-center">
              Ads keep this site free. Thank you for your support!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
