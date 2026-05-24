'use client';
// src/app/dashboard/page.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ImageCard from '@/components/ImageCard';
import { fetchImages, searchImages } from '@/lib/api';
import { ChevronLeft, ChevronRight, Frown } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="aspect-square skeleton" />
      <div className="px-3 py-2.5 space-y-2">
        <div className="h-3 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/4" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const params = useSearchParams();
  const router = useRouter();
  const queryParam = params.get('q') || '';

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQ, setSearchQ] = useState(queryParam);
  const [showAuthBanner, setShowAuthBanner] = useState(false);

  const loadImages = useCallback(async (q, p) => {
    setLoading(true);
    try {
      const data = q
        ? await searchImages(q, p)
        : await fetchImages(p);
      setImages(data.images || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages(searchQ, page);
  }, [searchQ, page, loadImages]);

  const handleSearch = (q) => {
    setSearchQ(q);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <Navbar onSearch={handleSearch} />

      {showAuthBanner && (
        <div className="bg-accent text-ink px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-3">
          <span>You've reached the free prompt limit. Sign up for unlimited access!</span>
          <button
            onClick={() => router.push('/auth/register')}
            className="underline font-semibold"
          >
            Register free →
          </button>
          <button onClick={() => setShowAuthBanner(false)} className="text-ink/60 hover:text-ink">
            ✕
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-ink mb-1">
            {searchQ ? `Results for "${searchQ}"` : 'AI Prompt Gallery'}
          </h1>
          <p className="text-muted text-sm">
            {searchQ
              ? 'Click any image to watch a short ad and reveal the prompt.'
              : 'Discover hand-picked AI prompts. Click to unlock.'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
            <Frown className="w-10 h-10" />
            <p className="font-display text-xl">No images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div key={img.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <ImageCard image={img} onAuthRequired={() => setShowAuthBanner(true)} />
              </div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:bg-cream transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:bg-cream transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
