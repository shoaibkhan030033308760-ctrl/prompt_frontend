"use client";
// src/lib/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Guest session ID — persisted in localStorage
function getGuestId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('guestId') || null;
}

function saveGuestId(id) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('guestId', id);
  }
}

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

// Attach auth token + guest ID on every request
// api.interceptors.request.use((config) => {
//   const token = Cookies.get('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;

//   // Always send guestId if present (backend uses it to track session)
//   const guestId = getGuestId();
//   if (guestId) config.headers['X-Guest-Id'] = guestId;

//   return config;
// });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const guestId = getGuestId();
    if (guestId) config.headers['X-Guest-Id'] = guestId;
  }

  return config;
});


// Capture X-Guest-Id from response headers and persist it
api.interceptors.response.use((response) => {
  const returnedGuestId = response.headers['x-guest-id'];
  if (returnedGuestId) {
    saveGuestId(returnedGuestId);
  }
  return response;
});

// ── Auth ─────────────────────────────────────────────────────────

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const { token, user } = res.data;
  Cookies.set('token', token, { expires: 7 });
  return { token, user };
}

export async function register(name, email, password) {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data;
}

export async function verifyOtp(email, otp) {
  const res = await api.post('/auth/verify-otp', { email, otp: String(otp) });
  return res.data;
}

export async function resendOtp(email) {
  const res = await api.post('/auth/resend-otp', { email });
  return res.data;
}

export async function logout() {
  await api.post('/auth/logout');
  Cookies.remove('token');
}

export async function forgotPassword(email) {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(email, otp, password) {
  const res = await api.post('/auth/reset-password', { email, otp: String(otp), password });
  return res.data;
}

// ── Images ───────────────────────────────────────────────────────

export async function fetchImages(page = 1, limit = 20) {
  const res = await api.get('/images', { params: { page, limit } });
  return res.data;
}

export async function searchImages(q, page = 1) {
  const res = await api.get('/images/search', { params: { q, page } });
  return res.data;
}

export async function fetchImagesByCategory(slug, page = 1) {
  const res = await api.get(`/images/category/${slug}`, { params: { page } });
  return res.data;
}

export async function fetchPrompt(imageId) {
  try {
    const res = await api.get(`/images/${imageId}/prompt`);
    return { ok: true, data: res.data };
  } catch (err) {
    if (err?.response?.status === 402) return { ok: false, adRequired: true };
    if (err?.response?.status === 403 || err?.response?.status === 429) {
      // Capture guestId from 429 response body if present
      const guestId = err?.response?.data?.guestId;
      if (guestId) saveGuestId(guestId);
      return { ok: false, guestLimitExceeded: true };
    }
    throw err;
  }
}

export async function markAdWatched() {
  const res = await api.post('/images/user/ad-watched');
  return res.data;
}

export async function toggleLike(imageId) {
  const res = await api.post(`/images/${imageId}/like`);
  return res.data;
}

export async function fetchUserLikes(page = 1) {
  const res = await api.get(`/user/liked`, { params: { page } });
  return res.data;
}

// ── Admin ────────────────────────────────────────────────────────

export async function adminListCategories() {
  const res = await api.get('/admin/categories');
  return res.data;
}

export async function adminCreateCategory(name) {
  const res = await api.post('/admin/category', { category: name });
  return res.data;
}

export async function adminDeleteCategory(id) {
  const res = await api.delete(`/admin/category/${id}`);
  return res.data;
}

export async function adminUploadImage(formData) {
  const res = await api.post('/admin/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function adminDeleteImage(id) {
  const res = await api.delete(`/admin/image/${id}`);
  return res.data;
}
