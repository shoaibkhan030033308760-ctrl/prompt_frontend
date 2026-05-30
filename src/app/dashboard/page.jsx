'use client';
// src/app/dashboard/page.jsx
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ImageCard from '@/components/ImageCard';
import { fetchImages, searchImages } from '@/lib/api';
import { ChevronLeft, ChevronRight, Frown, X, Sparkles } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="aspect-square skeleton" />
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="h-2.5 skeleton rounded w-2/3" />
        <div className="h-2.5 skeleton rounded w-6" />
      </div>
    </div>
  );
}

function DashboardInner() {
  const params     = useSearchParams();
  const router     = useRouter();
  const queryParam = params.get('q') || '';

  const [images,          setImages]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [page,            setPage]            = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [total,           setTotal]           = useState(0);
  const [searchQ,         setSearchQ]         = useState(queryParam);
  const [showLimitBanner, setShowLimitBanner] = useState(false);

  const loadImages = useCallback(async (q, p) => {
    setLoading(true);
    try {
      const data = q ? await searchImages(q, p) : await fetchImages(p);
      setImages(data.images || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearchQ(queryParam);
    setPage(1);
  }, [queryParam]);

  useEffect(() => { loadImages(searchQ, page); }, [searchQ, page, loadImages]);

  const handleSearch = (q) => {
    setSearchQ(q);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <Navbar onSearch={handleSearch} />

      {/* Limit banner */}
      {showLimitBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-amber-800 text-sm font-medium">
            🔒 You&apos;ve viewed your 5 free prompts
          </span>
          <button
            onClick={() => router.push('/auth/register')}
            className="bg-ink text-paper text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Register Free — Unlimited Access →
          </button>
          <button onClick={() => setShowLimitBanner(false)} className="text-amber-600 hover:text-amber-800 ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          {searchQ ? (
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-ink">
                Results for &ldquo;{searchQ}&rdquo;
              </h1>
              <p className="text-muted text-sm mt-1">
                {loading ? 'Searching…' : `${total} prompt${total !== 1 ? 's' : ''} found`}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-ink flex items-center gap-3">
                AI Prompt Gallery
                <Sparkles className="w-6 h-6 text-accent" />
              </h1>
              <p className="text-muted text-sm mt-1">
                Discover hand-picked prompts — watch a short ad to unlock each one
              </p>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-muted">
            <Frown className="w-10 h-10" />
            <p className="font-display text-xl">No prompts found</p>
            {searchQ && (
              <button
                onClick={() => handleSearch('')}
                className="text-accent text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {images.map((img, i) => (
              <div key={img.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i * 25, 400)}ms`, animationFillMode: 'both' }}>
                <ImageCard image={img} onPromptLimitReached={() => setShowLimitBanner(true)} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              disabled={page === 1}
              onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:bg-cream transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted font-medium">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="sticky top-0 z-40 bg-paper/95 border-b border-border h-14" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    }>
      <DashboardInner />
    </Suspense>
  );
}
