'use client';
// src/app/admin/page.jsx
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  adminListCategories,
  adminCreateCategory,
  adminDeleteCategory,
  adminUploadImage,
  adminDeleteImage,
  fetchImages,
} from '@/lib/api';
import {
  Plus, Trash2, Upload, Loader2, LogOut,
  Tag, Image as ImageIcon, LayoutDashboard, X,
} from 'lucide-react';

// ── Guard: redirect non-admins ────────────────────────────────────
function useAdminGuard() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait one tick for auth to hydrate from localStorage
    const t = setTimeout(() => {
      if (!isLoggedIn) {
        router.replace('/auth/login');
      } else if (user?.role !== 'admin') {
        router.replace('/dashboard');
      } else {
        setReady(true);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [isLoggedIn, user, router]);

  return ready;
}

// ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const ready = useAdminGuard();
  const { user, clearAuth } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState('images'); // 'images' | 'categories'

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-ink text-paper px-6 h-14 flex items-center justify-between border-b border-ink">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-accent" />
          <span className="font-display text-lg">
            Prompt<span className="text-accent">Vault</span> Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-muted hover:text-paper text-sm transition-colors"
          >
            ← View Site
          </button>
          <span className="text-muted text-sm hidden sm:block">{user?.name}</span>
          <button
            onClick={clearAuth}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-paper transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <TabBtn active={tab === 'images'} onClick={() => setTab('images')} icon={<ImageIcon className="w-4 h-4" />} label="Images" />
          <TabBtn active={tab === 'categories'} onClick={() => setTab('categories')} icon={<Tag className="w-4 h-4" />} label="Categories" />
        </div>

        {tab === 'images'     && <ImagesTab />}
        {tab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active
          ? 'border-accent text-ink'
          : 'border-transparent text-muted hover:text-ink'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Images Tab ────────────────────────────────────────────────────
function ImagesTab() {
  const [images,     setImages]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  // Upload form state
  const [prompt,     setPrompt]     = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [imgData, catData] = await Promise.all([
        fetchImages(1, 50),
        adminListCategories(),
      ]);
      setImages(imgData.images || []);
      setCategories(catData.categories || []);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file)   return setError('Please select an image.');
    if (!prompt.trim()) return setError('Prompt is required.');

    const fd = new FormData();
    fd.append('image', file);
    fd.append('prompt', prompt.trim());
    if (categoryId) fd.append('categoryId', categoryId);

    setUploading(true);
    try {
      await adminUploadImage(fd);
      setSuccess('Image uploaded successfully!');
      setPrompt('');
      setCategoryId('');
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this image?')) return;
    try {
      await adminDeleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      setSuccess('Image deleted.');
    } catch {
      setError('Delete failed.');
    }
  }

  const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

  return (
    <div className="space-y-8">
      {/* Upload form */}
      <section className="bg-white border border-border rounded-2xl p-6">
        <h2 className="font-display text-xl text-ink mb-5 flex items-center gap-2">
          <Upload className="w-5 h-5 text-accent" /> Upload New Image
        </h2>

        {error   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">{success}</div>}

        <form onSubmit={handleUpload} className="space-y-4">
          {/* File picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent transition-colors"
          >
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="preview" className="max-h-40 rounded-lg mx-auto" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted">
                <ImageIcon className="w-8 h-8" />
                <p className="text-sm">Click to select image</p>
                <p className="text-xs">JPG, PNG, WEBP — max 10MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Prompt *</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder="A detailed AI prompt describing this image…"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Category (optional)</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 bg-ink text-paper px-6 py-2.5 rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading…' : 'Upload Image'}
          </button>
        </form>
      </section>

      {/* Images list */}
      <section>
        <h2 className="font-display text-xl text-ink mb-4">
          All Images <span className="text-muted text-base font-sans">({images.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 text-muted">No images uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => {
              const src = img.imageUrl?.startsWith('http') ? img.imageUrl : `${BASE}${img.imageUrl}`;
              return (
                <div key={img.id} className="group relative bg-white border border-border rounded-xl overflow-hidden">
                  <div className="aspect-square">
                    <img src={src} alt="uploaded" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted truncate">{img.prompt}</p>
                    {img.category && (
                      <span className="text-xs bg-cream text-ink px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        {img.category.name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Categories Tab ────────────────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState('');
  const [creating,   setCreating]   = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await adminListCategories();
      setCategories(data.categories || []);
    } catch {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await adminCreateCategory(newName.trim());
      setNewName('');
      setSuccess('Category created!');
      await loadCategories();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create category.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete category "${name}"? All its images will be uncategorized.`)) return;
    try {
      await adminDeleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSuccess('Category deleted.');
    } catch {
      setError('Delete failed.');
    }
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <section className="bg-white border border-border rounded-2xl p-6">
        <h2 className="font-display text-xl text-ink mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" /> New Category
        </h2>

        {error   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">{success}</div>}

        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="flex-1 px-3 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            placeholder="e.g. Nature, Architecture, Portraits…"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      </section>

      {/* Categories list */}
      <section>
        <h2 className="font-display text-xl text-ink mb-4">
          All Categories <span className="text-muted text-base font-sans">({categories.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-muted">No categories yet. Create one above.</div>
        ) : (
          <div className="bg-white border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <span className="text-sm font-medium text-ink">{cat.name}</span>
                  <span className="ml-2 text-xs text-muted">/{cat.slug}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
