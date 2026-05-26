'use client';
// src/components/ImageCard.jsx
import { useState } from 'react';
import { Heart, Eye, Lock, UserPlus } from 'lucide-react';
import AdWall from './AdWall';
import PromptModal from './PromptModal';
import { fetchPrompt, toggleLike } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ImageCard({ image, onPromptLimitReached }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [showAdWall,    setShowAdWall]    = useState(false);
  const [promptData,    setPromptData]    = useState(null);
  const [liked,         setLiked]         = useState(false);
  const [likeCount,     setLikeCount]     = useState(image.totalLikes);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  // Guest like toast
  const [showGuestLikeMsg, setShowGuestLikeMsg] = useState(false);

  const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
  const src  = image.imageUrl?.startsWith('http') ? image.imageUrl : `${BASE}${image.imageUrl}`;
  const isGuest = !isLoggedIn;

  // ── Click image → fetch prompt ─────────────────────────────
  const handleImageClick = async () => {
    if (loadingPrompt || showAdWall || promptData) return;

    setLoadingPrompt(true);
    const result = await fetchPrompt(image.id);
    setLoadingPrompt(false);

    if (result.adRequired) {
      // Show AdWall — both guest and logged-in
      setShowAdWall(true);
    } else if (result.guestLimitExceeded) {
      // Guest hit 5-prompt limit → show register banner in dashboard
      onPromptLimitReached?.();
    } else if (result.ok) {
      // Within guest free quota (before ad) — shouldn't normally happen
      // but handle gracefully
      setPromptData(result.data.image);
    }
  };

  // ── AdWall confirmed — receives image data directly (no re-fetch) ──
  // AdWall does: markAdWatched → fetchPrompt (inside AdWall) → passes data here
  const handleAdUnlocked = (imageData) => {
    setShowAdWall(false);
    setPromptData(imageData);
  };

  // ── Like button ───────────────────────────────────────────
  const handleLike = async (e) => {
    e?.stopPropagation();
    if (!isLoggedIn) {
      // Show small inline message — NOT the prompt limit banner
      setShowGuestLikeMsg(true);
      setTimeout(() => setShowGuestLikeMsg(false), 3000);
      return;
    }
    try {
      const res = await toggleLike(image.id);
      setLiked(res.liked);
      setLikeCount(res.totalLikes);
    } catch {
      // silently ignore
    }
  };

  return (
    <>
      <div
        className="image-card bg-paper border border-border rounded-xl overflow-hidden cursor-pointer group relative"
        onClick={handleImageClick}
        style={{ animationFillMode: 'both' }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-cream">
          <img
            src={src}
            alt="AI generated image"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
              {loadingPrompt ? (
                <div className="w-10 h-10 border-2 border-paper border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-paper/90 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-ink" />
                  </div>
                  <span className="text-paper text-xs font-medium bg-ink/60 px-2 py-1 rounded-full">
                    Watch Ad → View Prompt
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Category badge */}
          {image.category && (
            <div className="absolute top-2 left-2 bg-paper/90 text-ink text-xs px-2 py-1 rounded-full font-medium">
              {image.category.name}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2.5 flex items-center justify-between">
          <span className="text-muted text-xs truncate max-w-[140px]">View to reveal prompt</span>
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-muted hover:text-red-500 transition-colors relative"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-xs">{likeCount}</span>
          </button>
        </div>

        {/* Guest like tooltip */}
        {showGuestLikeMsg && (
          <div
            className="absolute bottom-10 right-2 z-20 bg-ink text-paper text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            <UserPlus className="w-3 h-3 shrink-0" />
            <span>Sign up to like prompts</span>
            <button
              onClick={(e) => { e.stopPropagation(); router.push('/auth/register'); }}
              className="underline font-semibold ml-1"
            >
              Register
            </button>
          </div>
        )}
      </div>

      {showAdWall && (
        <AdWall
          imageUrl={src}
          imageId={image.id}
          onUnlocked={handleAdUnlocked}
          onClose={() => setShowAdWall(false)}
          isGuest={isGuest}
        />
      )}

      {promptData && (
        <PromptModal
          image={promptData}
          onClose={() => setPromptData(null)}
          onLike={handleLike}
          liked={liked}
          likeCount={likeCount}
        />
      )}
    </>
  );
}
