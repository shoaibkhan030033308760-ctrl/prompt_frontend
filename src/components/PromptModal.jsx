'use client';
// src/components/PromptModal.jsx
import { X, Heart, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';

export default function PromptModal({ image, onClose, onLike, liked, likeCount }) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    if (!image.prompt) return;
    await navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // FIX: same URL fix as ImageCard — strip /api from base
  const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
  const src  = image.imageUrl?.startsWith('http') ? image.imageUrl : `${BASE}${image.imageUrl}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-paper rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex">
          {/* Left: image */}
          <div className="w-64 shrink-0 hidden md:block">
            <img src={src} alt="AI" className="w-full h-full object-cover" />
          </div>

          {/* Right: prompt + actions */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="font-display text-xl text-ink">The Prompt</h3>
                {image.category && (
                  <span className="text-muted text-xs">{image.category.name}</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-border transition-colors"
              >
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>

            {/* Prompt text */}
            <div className="flex-1 px-6 py-5 overflow-y-auto max-h-60">
              <p className="text-ink leading-relaxed text-sm font-body">
                {image.prompt || 'No prompt available.'}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-border flex items-center gap-3">
              <button
                onClick={copyPrompt}
                className="flex items-center gap-2 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors"
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>

              <button
                onClick={onLike}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border transition-colors ${
                  liked
                    ? 'border-red-300 text-red-500 bg-red-50'
                    : 'border-border text-muted hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                {likeCount}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
