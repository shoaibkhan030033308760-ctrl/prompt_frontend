'use client';
// src/components/AdWall.jsx
import { useEffect, useState, useRef } from 'react';
// import { markAdWatched, markGuestAdWatched } from '@/lib/api';
import { markAdWatched, markGuestAdWatched, fetchPrompt } from '@/lib/api';
import { Lock, ExternalLink, CheckCircle, Loader2, Clock } from 'lucide-react';

const AD_URL = 'https://omg10.com/4/11059140';
const WAIT_SECONDS = 5;

// onUnlocked(imageData) — called with already-fetched image data so ImageCard
// does NOT need to re-fetch (which would hit the reset adWatched and return 402)
export default function AdWall({ imageUrl, onUnlocked, onClose, isGuest = false, imageId }) {
  const [phase,     setPhase]     = useState('idle');
  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const timerRef = useRef(null);

  const handleWatchAd = () => {
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

  const handleConfirm = async () => {
    setPhase('confirming');
    try {
      // Step 1: mark ad watched on backend (sets adWatched = true)
      if (isGuest) {
        await markGuestAdWatched();
      } else {
        await markAdWatched();
      }

      // Step 2: now fetch the prompt — backend sees adWatched=true, serves it, resets flag
      // const { fetchPrompt } = await import('@/lib/api');
      const result = await fetchPrompt(imageId);

      if (result.ok) {
        setPhase('done');
        // Pass image data up — ImageCard will NOT re-fetch
        setTimeout(() => onUnlocked(result.data.image), 600);
      } else {
        setPhase('error');
      }
    } catch {
      setPhase('error');
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      <div className="relative z-10 w-full max-w-sm mx-4 bg-paper rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-ink px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent" />
            <span className="font-display text-paper text-lg">Unlock Prompt</span>
          </div>
          {phase === 'idle' && (
            <button onClick={onClose} className="text-muted hover:text-paper transition-colors text-sm">
              Cancel
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-8 text-center">

          {phase === 'idle' && (
            <>
              <div className="w-16 h-16 rounded-full bg-cream border-2 border-border flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-2xl text-ink mb-2">Watch a Short Ad</h3>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Click below to open the ad. After <strong>{WAIT_SECONDS} seconds</strong>, come back and confirm to unlock the prompt.
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

          {phase === 'waiting' && (
            <>
              <div className="w-20 h-20 rounded-full bg-cream border-2 border-accent flex items-center justify-center mx-auto mb-5">
                <span className="font-display text-3xl text-accent">{countdown}</span>
              </div>
              <h3 className="font-display text-xl text-ink mb-2">Ad is Open</h3>
              <p className="text-muted text-sm mb-4">Come back here once the timer hits zero.</p>
              <div className="flex items-center justify-center gap-2 text-muted text-sm">
                <Clock className="w-4 h-4" />
                <span>Wait {countdown}s…</span>
              </div>
              <button
                onClick={() => window.open(AD_URL, '_blank', 'noopener')}
                className="mt-4 text-accent text-xs hover:underline"
              >
                Re-open ad tab
              </button>
            </>
          )}

          {phase === 'ready' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-display text-xl text-ink mb-2">Timer Complete!</h3>
              <p className="text-muted text-sm mb-6">Thanks for watching. Click below to unlock.</p>
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                I Watched — Unlock Prompt
              </button>
            </>
          )}

          {phase === 'confirming' && (
            <>
              <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
              <p className="text-ink font-medium">Unlocking…</p>
            </>
          )}

          {phase === 'done' && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-display text-xl text-ink">Unlocked!</p>
              <p className="text-muted text-sm mt-1">Revealing the prompt…</p>
            </>
          )}

          {phase === 'error' && (
            <>
              <p className="text-ink font-medium mb-3">Something went wrong. Please try again.</p>
              <button onClick={handleConfirm} className="text-accent hover:underline text-sm font-medium">
                Retry
              </button>
            </>
          )}
        </div>

        {(phase === 'idle' || phase === 'waiting') && (
          <div className="px-6 pb-5">
            <p className="text-muted text-xs text-center">Ads keep this site free. Thank you!</p>
          </div>
        )}
      </div>
    </div>
  );
}
