'use client';
// src/components/ImageCard.jsx
import { useState } from 'react';
import { Heart, Lock, UserPlus } from 'lucide-react';
import AdWall from './AdWall';
import PromptModal from './PromptModal';
import { fetchPrompt, toggleLike } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ImageCard({ image, onPromptLimitReached }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [showAdWall,       setShowAdWall]       = useState(false);
  const [promptData,       setPromptData]       = useState(null);
  const [liked,            setLiked]            = useState(false);
  const [likeCount,        setLikeCount]        = useState(image.totalLikes);
  const [loadingPrompt,    setLoadingPrompt]    = useState(false);
  const [showGuestLikeMsg, setShowGuestLikeMsg] = useState(false);

  const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
  const src  = image.imageUrl?.startsWith('http') ? image.imageUrl : `${BASE}${image.imageUrl}`;

  const handleImageClick = async () => {
    if (loadingPrompt || showAdWall || promptData) return;
    setLoadingPrompt(true);
    try {
      const result = await fetchPrompt(image.id);
      if (result.adRequired) {
        setShowAdWall(true);
      } else if (result.guestLimitExceeded) {
        onPromptLimitReached?.();
      } else if (result.ok) {
        setPromptData(result.data.image);
      }
    } catch {
      // ignore
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Called by AdWall with image data already fetched — no re-fetch needed
  const handleAdUnlocked = (imageData) => {
    setShowAdWall(false);
    setPromptData(imageData);
  };

  const handleLike = async (e) => {
    e?.stopPropagation();
    if (!isLoggedIn) {
      setShowGuestLikeMsg(true);
      setTimeout(() => setShowGuestLikeMsg(false), 3000);
      return;
    }
    try {
      const res = await toggleLike(image.id);
      setLiked(res.liked);
      setLikeCount(res.totalLikes);
    } catch { /* ignore */ }
  };

  return (
    <>
      <div
        className="image-card bg-paper border border-border rounded-xl overflow-hidden cursor-pointer group relative select-none"
        onClick={handleImageClick}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-cream">
          <img
            src={src}
            alt="AI prompt"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2">
              {loadingPrompt ? (
                <div className="w-9 h-9 border-2 border-paper border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <div className="w-11 h-11 rounded-full bg-paper/90 shadow flex items-center justify-center">
                    <Lock className="w-4 h-4 text-ink" />
                  </div>
                  <span className="text-paper text-xs font-medium bg-ink/70 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    Watch Ad → Unlock
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Category */}
          {image.category && (
            <div className="absolute top-2 left-2 bg-paper/90 text-ink text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
              {image.category.name}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-muted text-[11px] truncate max-w-[120px]">Tap to unlock prompt</span>
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-muted hover:text-red-500 transition-colors py-1 px-1 rounded"
          >
            <Heart className={`w-3.5 h-3.5 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
            <span className="text-[11px] font-medium">{likeCount}</span>
          </button>
        </div>

        {/* Guest like tooltip */}
        {showGuestLikeMsg && (
          <div
            className="absolute bottom-11 right-2 z-20 bg-ink text-paper text-xs px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 whitespace-nowrap animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <UserPlus className="w-3 h-3 shrink-0 text-accent" />
            <span>Sign up to like prompts</span>
            <button
              onClick={(e) => { e.stopPropagation(); router.push('/auth/register'); }}
              className="underline font-semibold text-accent"
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
          isGuest={!isLoggedIn}
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
