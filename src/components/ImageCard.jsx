'use client';
// src/components/ImageCard.jsx
import { useState } from 'react';
import { Heart, Eye, Lock } from 'lucide-react';
import AdWall from './AdWall';
import PromptModal from './PromptModal';
import { fetchPrompt, toggleLike } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ImageCard({ image, onAuthRequired }) {
  const { isLoggedIn } = useAuth();

  const [showAdWall,    setShowAdWall]    = useState(false);
  const [promptData,    setPromptData]    = useState(null);
  const [liked,         setLiked]         = useState(false);
  const [likeCount,     setLikeCount]     = useState(image.totalLikes);
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
  const src  = image.imageUrl?.startsWith('http') ? image.imageUrl : `${BASE}${image.imageUrl}`;

  // Guest = not logged in
  const isGuest = !isLoggedIn;

  const handleImageClick = async () => {
    if (loadingPrompt) return;

    setLoadingPrompt(true);
    const result = await fetchPrompt(image.id);
    setLoadingPrompt(false);

    if (result.adRequired) {
      // Both guests and logged-in users see the AdWall
      setShowAdWall(true);
    } else if (result.guestLimitExceeded) {
      onAuthRequired?.();
    } else if (result.ok) {
      setPromptData(result.data.image);
    }
  };

  // After AdWall reports ad completed + backend updated adWatched,
  // re-fetch the prompt (backend will now serve it and reset adWatched)
  const handleAdUnlocked = async () => {
    setShowAdWall(false);
    setLoadingPrompt(true);
    const result = await fetchPrompt(image.id);
    setLoadingPrompt(false);
    if (result.ok) setPromptData(result.data.image);
  };

  const handleLike = async (e) => {
    e?.stopPropagation();
    if (!isLoggedIn) { onAuthRequired?.(); return; }
    const res = await toggleLike(image.id);
    setLiked(res.liked);
    setLikeCount(res.totalLikes);
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
                    {isLoggedIn ? (
                      <Lock className="w-5 h-5 text-ink" />
                    ) : (
                      <Eye className="w-5 h-5 text-ink" />
                    )}
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
          <span className="text-muted text-xs truncate max-w-[140px]">
            View to reveal prompt
          </span>
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-muted hover:text-red-500 transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-xs">{likeCount}</span>
          </button>
        </div>
      </div>

      {showAdWall && (
        <AdWall
          imageUrl={src}
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
