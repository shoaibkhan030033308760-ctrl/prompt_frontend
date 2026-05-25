'use client';
// src/components/AdWall.jsx
import { useEffect } from 'react';
import { useMoneyTag } from '@/hooks/useMoneyTag';
import { Play, Loader2, CheckCircle, XCircle, Lock } from 'lucide-react';

// isGuest prop passed from ImageCard so we call the right backend endpoint
export default function AdWall({ imageUrl, onUnlocked, onClose, isGuest = false }) {
  const { adState, showAd } = useMoneyTag(isGuest);

  useEffect(() => {
    if (adState === 'completed') {
      const t = setTimeout(onUnlocked, 800);
      return () => clearTimeout(t);
    }
  }, [adState, onUnlocked]);

  return (
    <div className="ad-overlay fixed inset-0 z-50 flex items-center justify-center bg-ink/70">
      {/* Background blurred image */}
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
            <span className="font-display text-paper text-lg">Prompt Locked</span>
          </div>
          {adState === 'idle' && (
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
          <AdStateContent adState={adState} showAd={showAd} />
        </div>

        {/* Footer */}
        {adState === 'idle' && (
          <div className="px-6 pb-6">
            <p className="text-muted text-xs text-center">
              Watch a short ad to unlock the full prompt. Free users see 1 ad per prompt.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdStateContent({ adState, showAd }) {
  if (adState === 'idle') {
    return (
      <>
        <div className="w-16 h-16 rounded-full bg-cream border-2 border-border flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-accent" />
        </div>
        <h3 className="font-display text-2xl text-ink mb-2">Unlock This Prompt</h3>
        <p className="text-muted text-sm mb-6 leading-relaxed">
          Watch a short sponsored ad to access the full AI prompt behind this image.
        </p>
        <button
          onClick={showAd}
          className="w-full flex items-center justify-center gap-2 bg-ink text-paper font-medium py-3 px-6 rounded-xl hover:bg-accent-dark transition-colors"
        >
          <Play className="w-4 h-4" />
          Watch Ad &amp; Unlock
        </button>
      </>
    );
  }

  if (adState === 'loading') {
    return (
      <>
        <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
        <p className="text-ink font-medium">Loading ad…</p>
        <p className="text-muted text-sm mt-1">This will only take a moment.</p>
      </>
    );
  }

  if (adState === 'playing') {
    return (
      <>
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Play className="w-5 h-5 text-accent" />
        </div>
        <p className="text-ink font-medium">Ad is playing…</p>
        <p className="text-muted text-sm mt-1">Watch until the end to unlock the prompt.</p>
      </>
    );
  }

  if (adState === 'completed') {
    return (
      <>
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-ink font-display text-xl">Unlocked!</p>
        <p className="text-muted text-sm mt-1">Revealing the prompt…</p>
      </>
    );
  }

  if (adState === 'error') {
    return (
      <>
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-ink font-medium">Something went wrong</p>
        <p className="text-muted text-sm mt-1 mb-4">Please try again.</p>
        <button onClick={showAd} className="text-accent hover:underline text-sm font-medium">
          Retry
        </button>
      </>
    );
  }

  return null;
}
