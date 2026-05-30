'use client';
// src/components/AdWall.jsx
import { useEffect, useState, useRef } from 'react';
import { markAdWatched, markGuestAdWatched, fetchPrompt } from '@/lib/api';
import { Lock, ExternalLink, CheckCircle, Loader2, Clock, AlertCircle } from 'lucide-react';

const AD_URL      = 'https://omg10.com/4/11059140';
const WAIT_SECONDS = 5;

export default function AdWall({ imageUrl, imageId, onUnlocked, onClose, isGuest = false }) {
  const [phase,     setPhase]     = useState('idle');
  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const [errMsg,    setErrMsg]    = useState('');
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
    setErrMsg('');
    try {
      // Step 1: mark ad watched → sets adWatched=true in DB
      if (isGuest) {
        await markGuestAdWatched();
      } else {
        await markAdWatched();
      }

      // Step 2: fetch prompt — backend sees adWatched=true, serves it, resets flag
      const result = await fetchPrompt(imageId);

      if (result.ok) {
        setPhase('done');
        setTimeout(() => onUnlocked(result.data.image), 700);
      } else if (result.guestLimitExceeded) {
        // Guest hit limit after watching ad — still show prompt (handled in controller)
        // If controller returned 429 here it means truly exceeded
        setPhase('error');
        setErrMsg('Free prompt limit reached. Please register for unlimited access.');
      } else {
        setPhase('error');
        setErrMsg('Could not unlock the prompt. Please try again.');
      }
    } catch (err) {
      setPhase('error');
      setErrMsg('Connection error. Please check your internet and try again.');
    }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(10,10,10,0.65)' }}>
      {/* Blurred bg image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 scale-110"
        style={{ backgroundImage: `url(${imageUrl})`, filter: 'blur(20px)' }}
      />

      <div className="relative z-10 w-full max-w-sm bg-paper rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-ink px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent" />
            <span className="font-display text-paper text-lg">Unlock Prompt</span>
          </div>
          {(phase === 'idle') && (
            <button onClick={onClose} className="text-paper/50 hover:text-paper text-xs transition-colors">
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
                Open the sponsored page and wait <strong>{WAIT_SECONDS} seconds</strong>, then come back to unlock the prompt.
              </p>
              <button
                onClick={handleWatchAd}
                className="w-full flex items-center justify-center gap-2 bg-ink text-paper font-medium py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open Ad &amp; Start Timer
              </button>
            </>
          )}

          {phase === 'waiting' && (
            <>
              {/* Circular countdown */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#e8e2d6" strokeWidth="6" />
                  <circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke="#c8a96e" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (countdown / WAIT_SECONDS)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-3xl text-accent">{countdown}</span>
                </div>
              </div>
              <h3 className="font-display text-xl text-ink mb-2">Ad is Open</h3>
              <p className="text-muted text-sm mb-3">Come back when the timer hits zero.</p>
              <button
                onClick={() => window.open(AD_URL, '_blank', 'noopener')}
                className="text-accent text-xs hover:underline"
              >
                Re-open ad tab
              </button>
            </>
          )}

          {phase === 'ready' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-display text-xl text-ink mb-2">Done! Confirm to Unlock</h3>
              <p className="text-muted text-sm mb-6">Thanks for watching. Tap below to reveal the prompt.</p>
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 active:scale-95 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Unlock Prompt
              </button>
            </>
          )}

          {phase === 'confirming' && (
            <>
              <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
              <p className="text-ink font-medium">Unlocking…</p>
              <p className="text-muted text-sm mt-1">Just a moment</p>
            </>
          )}

          {phase === 'done' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <p className="font-display text-2xl text-ink">Unlocked!</p>
              <p className="text-muted text-sm mt-1">Revealing your prompt…</p>
            </>
          )}

          {phase === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-ink font-medium mb-1">Something went wrong</p>
              {errMsg && <p className="text-muted text-sm mb-4">{errMsg}</p>}
              <button
                onClick={handleConfirm}
                className="text-accent hover:underline text-sm font-medium"
              >
                Try again
              </button>
            </>
          )}
        </div>

        {(phase === 'idle' || phase === 'waiting') && (
          <p className="text-muted text-xs text-center pb-5">Ads keep this site free — thank you!</p>
        )}
      </div>
    </div>
  );
}
