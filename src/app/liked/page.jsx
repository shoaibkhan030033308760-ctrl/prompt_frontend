'use client';
// src/app/liked/page.jsx — User's liked prompts gallery
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ImageCard from '@/components/ImageCard';
import { fetchUserLikes } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Heart, ChevronLeft, ChevronRight, Frown } from 'lucide-react';

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

export default function LikedPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [images,     setImages]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) router.replace('/auth/login');
  }, [isLoggedIn, router]);

  const loadLiked = useCallback(async (p) => {
    setLoading(true);
    try {
      const data = await fetchUserLikes(p);
      setImages(data.likedImages || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadLiked(page);
  }, [isLoggedIn, page, loadLiked]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="font-display text-4xl text-ink">Liked Prompts</h1>
            <p className="text-muted text-sm mt-0.5">
              {total > 0 ? `${total} prompt${total !== 1 ? 's' : ''} you've liked` : 'No liked prompts yet'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
            <Frown className="w-10 h-10" />
            <p className="font-display text-xl">No liked prompts yet</p>
            <p className="text-sm">Click the heart on any prompt to save it here.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-2 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors"
            >
              Browse Gallery →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div key={img.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <ImageCard image={img} onAuthRequired={() => {}} />
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
