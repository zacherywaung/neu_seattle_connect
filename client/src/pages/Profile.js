import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import API from '../api';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');
  const isOwn = id === currentUserId;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', major: '', year: '', country: '', interests: '', bio: '',
  });
  const [original, setOriginal] = useState({});

  // Tab
  const [tab, setTab] = useState('posts');

  /* ─── Fetch profile ─── */
  useEffect(() => {
    const load = async () => {
      try {
        if (isOwn) {
          const meRes = await API.get('/api/users/me');
          const me = meRes.data.data;
          setUser(me);
          // Fetch own posts via public endpoint
          const postRes = await API.get(`/api/users/${id}`);
          setPosts(postRes.data.data.posts || []);
        } else {
          const res = await API.get(`/api/users/${id}`);
          const { posts: p, ...rest } = res.data.data;
          setUser(rest);
          setPosts(p || []);
        }
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isOwn]);

  /* ─── Populate edit form when user loads ─── */
  useEffect(() => {
    if (user && isOwn) {
      const f = {
        name: user.name || '',
        major: user.major || '',
        year: user.year || '',
        country: user.country || '',
        interests: Array.isArray(user.interests) ? user.interests.join(', ') : user.interests || '',
        bio: user.bio || '',
      };
      setForm(f);
      setOriginal(f);
    }
  }, [user, isOwn]);

  /* ─── Handlers ─── */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCancel = () => {
    setForm(original);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = { ...form };
      if (typeof updates.interests === 'string') {
        updates.interests = updates.interests.split(',').map((s) => s.trim()).filter(Boolean);
      }
      const res = await API.put('/api/users/me', updates);
      setUser(res.data.data);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      const upRes = await API.post('/api/upload/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = upRes.data.url || upRes.data.data?.url;
      if (url) {
        const res = await API.put('/api/users/me', { avatar: url });
        setUser(res.data.data);
      }
    } catch (err) {
      alert('Failed to upload avatar. Please try again.');
    }
  };

  const handleDeletePost = (postId) => setPosts(posts.filter((p) => p._id !== postId));
  const handleUpdatePost = (up) => setPosts(posts.map((p) => (p._id === up._id ? up : p)));

  /* ─── Loading / error ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <Navbar />
        <div className="text-center py-24">
          <div className="inline-block w-8 h-8 border-4 border-[#e5e5e5] border-t-[#C8102E] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#555555]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <Navbar />
        <div className="text-center py-24">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  /* ─── Derived values ─── */
  const interests = Array.isArray(user?.interests) ? user.interests : [];
  const saved = user?.savedPosts || [];

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Navbar />

      {/* Banner */}
      <div className="bg-[#C8102E] text-white pt-12 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-14">
        {/* ── Profile card ── */}
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#C8102E] text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              {isOwn && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="text-white text-xs font-medium">Change</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Info / edit form */}
            <div className="flex-1 w-full text-center sm:text-left">
              {!editing ? (
                <>
                  <h2 className="text-2xl font-bold text-[#111111]">{user?.name}</h2>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 mt-1 text-sm text-[#555555]">
                    {user?.major && <span>{user.major}</span>}
                    {user?.major && user?.year && <span>·</span>}
                    {user?.year && <span>{user.year}</span>}
                    {(user?.major || user?.year) && user?.country && <span>·</span>}
                    {user?.country && <span>{user.country}</span>}
                  </div>

                  {user?.bio && (
                    <p className="mt-3 text-[#111111] leading-relaxed">{user.bio}</p>
                  )}

                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {interests.map((item, i) => (
                        <span
                          key={i}
                          className="text-xs bg-[#f8f8f8] text-[#555555] px-3 py-1 rounded-full border border-[#e5e5e5]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {isOwn && (
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-4 px-5 py-2 border border-[#e5e5e5] text-[#555555] text-sm font-medium rounded-lg hover:bg-[#f0f0f0] transition-colors"
                    >
                      Edit profile
                    </button>
                  )}
                </>
              ) : (
                /* ── Edit form ── */
                <div className="w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Name</label>
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Major</label>
                      <input
                        type="text" name="major" value={form.major} onChange={handleChange}
                        placeholder="e.g. Computer Science"
                        className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Year</label>
                      <input
                        type="text" name="year" value={form.year} onChange={handleChange}
                        placeholder="e.g. 2025"
                        className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Country</label>
                      <input
                        type="text" name="country" value={form.country} onChange={handleChange}
                        placeholder="e.g. USA"
                        className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">Bio</label>
                    <textarea
                      name="bio" value={form.bio} onChange={handleChange} rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1">
                      Interests <span className="text-[#999] font-normal">(comma separated)</span>
                    </label>
                    <input
                      type="text" name="interests" value={form.interests} onChange={handleChange}
                      placeholder="e.g. Machine Learning, Web Dev, Basketball"
                      className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave} disabled={saving}
                      className="px-6 py-2 bg-[#C8102E] text-white font-semibold rounded-lg hover:bg-[#a00d24] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 border border-[#e5e5e5] text-[#555555] rounded-lg hover:bg-[#f0f0f0] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-white border border-[#e5e5e5] rounded-lg p-1">
          <button
            onClick={() => setTab('posts')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'posts' ? 'bg-[#C8102E] text-white' : 'text-[#555555] hover:bg-[#f8f8f8]'
            }`}
          >
            Posts ({posts.length})
          </button>
          {isOwn && (
            <button
              onClick={() => setTab('saved')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'saved' ? 'bg-[#C8102E] text-white' : 'text-[#555555] hover:bg-[#f8f8f8]'
              }`}
            >
              Saved ({saved.length})
            </button>
          )}
        </div>

        {/* ── Posts tab ── */}
        {tab === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-[#e5e5e5]">
                <p className="text-4xl mb-4">📝</p>
                <h3 className="text-lg font-semibold text-[#111111] mb-2">
                  {isOwn ? "You haven't posted yet" : 'No posts yet'}
                </h3>
                {isOwn && (
                  <button
                    onClick={() => navigate('/feed')}
                    className="mt-2 px-5 py-2 bg-[#C8102E] text-white text-sm font-semibold rounded-lg hover:bg-[#a00d24] transition-colors"
                  >
                    Go to Feed
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((p) => (
                  <PostCard
                    key={p._id}
                    post={p}
                    onDelete={isOwn ? handleDeletePost : undefined}
                    onUpdate={isOwn ? handleUpdatePost : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Saved tab ── */}
        {tab === 'saved' && isOwn && (
          <div>
            {saved.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-[#e5e5e5]">
                <p className="text-4xl mb-4">🔖</p>
                <h3 className="text-lg font-semibold text-[#111111] mb-2">No saved posts yet</h3>
                <p className="text-[#555555]">Posts you save will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {saved.map((p) => (
                  <PostCard key={p._id || p} post={p} isSaved={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-12"></div>
    </div>
  );
}