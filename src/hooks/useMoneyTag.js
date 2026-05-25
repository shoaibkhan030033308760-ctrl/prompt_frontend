// src/hooks/useMoneyTag.js
import { useEffect, useRef, useState } from 'react';
import { markAdWatched, markGuestAdWatched } from '@/lib/api';

// isGuest: true = call /guest/ad-watched, false = call /user/ad-watched
export function useMoneyTag(isGuest = false) {
  const [adState, setAdState] = useState('idle'); // 'idle' | 'loading' | 'playing' | 'completed' | 'error'
  const scriptLoaded = useRef(false);

  // Load MoneyTag script once on mount
  useEffect(() => {
    const scriptUrl = process.env.NEXT_PUBLIC_MONEYTAG_SCRIPT_URL;
    if (!scriptUrl || scriptLoaded.current) return;

    const existing = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existing) {
      scriptLoaded.current = true;
      return;
    }

    const script   = document.createElement('script');
    script.src     = scriptUrl;
    script.async   = true;
    script.onload  = () => { scriptLoaded.current = true; };
    script.onerror = () => { console.error('[MoneyTag] Failed to load ad script'); };
    document.head.appendChild(script);
  }, []);

  const showAd = () => {
    setAdState('loading');

    const trigger = () => {
      const showFn = window.mtShowAd || window.MoneyTag?.showAd;

      if (!showFn) {
        setTimeout(trigger, 500);
        return;
      }

      setAdState('playing');

      showFn({
        onComplete: async () => {
          try {
            // Call the correct backend endpoint based on user type
            if (isGuest) {
              await markGuestAdWatched();
            } else {
              await markAdWatched();
            }
            setAdState('completed');
          } catch {
            setAdState('error');
          }
        },
        onSkip: () => {
          setAdState('idle');
        },
      });
    };

    trigger();
  };

  const reset = () => setAdState('idle');

  return { adState, showAd, reset };
}
