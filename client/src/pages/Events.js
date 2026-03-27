import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';

export default function Events() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    images: [],
  });

  const isLoggedIn = !!localStorage.getItem('token');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/api/posts?category=Events');
      const data = res.data;
      console.log('GET response:', data);
      const list = Array.isArray(data) ? data : data.posts || data.data || [];
      setPosts(list);
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.content && p.content.toLowerCase().includes(q))
    );
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await API.post('/api/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, images: [...f.images, res.data.url] }));
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await API.post('/api/posts', {
        title: form.title,
        content: form.content,
        category: 'Events',
        tags,
        images: form.images,
      });
      setForm({ title: '', content: '', tags: '', images: [] });
      setShowForm(false);
      await fetchPosts();
    } catch {
      setError('Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleUpdate = (updated) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#111111' }}>
            Campus Events
          </h1>
          {isLoggedIn && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#C8102E' }}
            >
              + New Event
            </button>
          )}
        </div>

        {/* New Event Form */}
        {showForm && (
          <div
            className="rounded-xl p-6 mb-6"
            style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#111111' }}>
              Create an Event
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                  Title <span style={{ color: '#C8102E' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
                  style={{ border: '1px solid #e5e5e5', color: '#111111' }}
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                  Content <span style={{ color: '#C8102E' }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-vertical focus:ring-2"
                  style={{ border: '1px solid #e5e5e5', color: '#111111' }}
                  placeholder="Describe the event..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value="Events"
                    disabled
                    className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                    style={{
                      border: '1px solid #e5e5e5',
                      backgroundColor: '#f8f8f8',
                      color: '#555555',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    Tags
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #e5e5e5', color: '#111111' }}
                    placeholder="workshop, social, ..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm"
                  style={{ color: '#555555' }}
                />
                {uploading && (
                  <p className="text-xs mt-1" style={{ color: '#555555' }}>
                    Uploading...
                  </p>
                )}
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {form.images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`upload-${i}`}
                        className="w-16 h-16 object-cover rounded-lg"
                        style={{ border: '1px solid #e5e5e5' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: '#555555', border: '1px solid #e5e5e5' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#C8102E' }}
                >
                  {submitting ? 'Posting...' : 'Post Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title or content..."
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              color: '#111111',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-lg px-4 py-3 mb-4 text-sm"
            style={{ backgroundColor: '#fef2f2', color: '#C8102E', border: '1px solid #fecaca' }}
          >
            {error}
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12" style={{ color: '#555555' }}>
            <p className="text-sm">Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#555555' }}>
            <p className="text-sm">
              {search ? 'No events match your search.' : 'No events yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}