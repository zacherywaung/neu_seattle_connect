import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import CommentSection from './CommentSection';

// PostCard — displays a single post with like, save, comment, signup, and delete actions
// Props:
//   post               — the post object from the backend
//   onDelete           — callback after post is deleted (optional)
//   onUpdate           — callback after post is liked/saved/signup (optional)
//   isSaved            — whether the current user has saved this post (optional)
//   disableAuthorClick — disable clicking on avatar/name (optional)

export default function PostCard({ post, onDelete, onUpdate, isSaved: initialSaved = false, disableAuthorClick = false }) {
  const navigate      = useNavigate();
  const userId        = localStorage.getItem('userId');
  const token         = localStorage.getItem('token');
  const isOwnPost     = userId && post.author?._id === userId;
  const [showComments, setShowComments] = useState(false);
  const [showSignups, setShowSignups] = useState(false);

  // Save state
  const [saved, setSaved] = useState(initialSaved);
  const [saveAnim, setSaveAnim] = useState(false);

  // Signup state
  const signupList = post.signups || [];
  const [signups, setSignups] = useState(signupList);
  const [signupAnim, setSignupAnim] = useState(false);
  const isSignedUp = signups.some(
    (u) => (typeof u === 'object' ? u._id : u) === userId
  );
  const hasSignup = post.category === 'Events' || post.category === 'Projects';

  // Like state
  const likeList  = post.reactions?.like || [];
  const isLiked   = likeList.map(id => id.toString()).includes(userId);
  const likeCount = likeList.length;

  // Category badge colors
  const badgeColors = {
    Events:   'bg-red-100 text-red-700',
    Projects: 'bg-blue-100 text-blue-700',
    General:  'bg-gray-100 text-gray-600',
  };

  const handleLike = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const res = await API.patch(`/api/posts/${post._id}/react`, { type: 'like' });
      if (onUpdate) onUpdate(res.data.data);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleSave = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const res = await API.post(`/api/users/me/save/${post._id}`);
      const nowSaved = res.data.saved;
      setSaved(nowSaved);
      setSaveAnim(true);
      setTimeout(() => setSaveAnim(false), 400);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleSignup = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const res = await API.patch(`/api/posts/${post._id}/signup`);
      setSignups(res.data.data.signups || []);
      setSignupAnim(true);
      setTimeout(() => setSignupAnim(false), 400);
      if (onUpdate) onUpdate(res.data.data);
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/api/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Format timestamp as relative time
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Author initials for avatar fallback
  const initials = post.author?.name
    ? post.author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      {/* Post header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            onClick={() => !disableAuthorClick && navigate(`/profile/${post.author?._id}`)}
            className={`w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-xs font-semibold text-[#C8102E] flex-shrink-0 overflow-hidden ${
              disableAuthorClick ? '' : 'cursor-pointer'
            }`}
          >
            {post.author?.avatar
              ? <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
              : initials
            }
          </div>
          {/* Author info */}
          <div>
            <span
              onClick={() => !disableAuthorClick && navigate(`/profile/${post.author?._id}`)}
              className={`text-sm font-semibold text-gray-900 ${
                disableAuthorClick ? '' : 'cursor-pointer hover:underline'
              }`}
            >
              {post.author?.name}
            </span>
            {post.author?.major && (
              <span className="text-xs text-gray-400 ml-1">· {post.author.major}</span>
            )}
            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {/* Category badge */}
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColors[post.category] || badgeColors.General}`}>
          {post.category}
        </span>
      </div>

      {/* Post content */}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{post.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{post.content}</p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {post.images.map((url, i) => (
            <img key={i} src={url} alt="" className="rounded-lg max-h-48 object-cover" />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {post.tags.map((tag, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Signup section — only for Events and Projects */}
      {hasSignup && (
        <div className="mb-3 p-3 rounded-lg bg-[#f8f8f8] border border-[#e5e5e5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#111111]">
                {post.category === 'Events' ? '📋 Signups' : '🤝 Members'}
              </span>
              <span className="text-xs text-[#555555] bg-white px-2 py-0.5 rounded-full border border-[#e5e5e5]">
                {signups.length} {signups.length === 1 ? 'person' : 'people'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle signup list */}
              {signups.length > 0 && (
                <button
                  onClick={() => setShowSignups(!showSignups)}
                  className="text-xs text-[#555555] hover:text-[#111111] transition-colors"
                >
                  {showSignups ? 'Hide list' : 'View list'}
                </button>
              )}
              {/* Signup / Cancel button — don't show on own post */}
              {!isOwnPost && (
                <button
                  onClick={handleSignup}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    isSignedUp
                      ? 'bg-white border border-[#e5e5e5] text-[#555555] hover:border-red-300 hover:text-red-600'
                      : 'bg-[#C8102E] text-white hover:bg-[#a00d24]'
                  } ${signupAnim ? 'scale-110' : 'scale-100'}`}
                  style={{ transition: 'transform 0.2s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease' }}
                >
                  {isSignedUp
                    ? (post.category === 'Events' ? 'Cancel signup' : 'Leave')
                    : (post.category === 'Events' ? 'Sign up' : 'Join')
                  }
                </button>
              )}
            </div>
          </div>

          {/* Signup list */}
          {showSignups && signups.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#e5e5e5] space-y-2">
              {signups.map((u, i) => {
                const user = typeof u === 'object' ? u : { _id: u, name: 'User' };
                const userInitial = user.name?.charAt(0)?.toUpperCase() || '?';
                return (
                  <div key={user._id || i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#C8102E] text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <span className="text-sm text-[#111111]">{user.name}</span>
                    {user.major && (
                      <span className="text-xs text-[#555555]">· {user.major}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
            isLiked ? 'text-[#C8102E]' : 'text-gray-400 hover:text-[#C8102E]'
          }`}
        >
          {isLiked ? '♥' : '♡'} {likeCount}
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700"
        >
          💬 Comment
        </button>

        {/* Save / Unsave with animation */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1 text-xs font-medium transition-all duration-200 ${
            saved
              ? 'text-[#C8102E]'
              : 'text-gray-400 hover:text-gray-700'
          }`}
          style={{ transform: saveAnim ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.2s ease, color 0.2s ease' }}
        >
          {saved ? '🔖' : '📑'} {saved ? 'Saved' : 'Save'}
        </button>

        {/* Delete (own posts only) */}
        {isOwnPost && (
          <button
            onClick={handleDelete}
            className="ml-auto text-xs text-gray-300 hover:text-red-500"
          >
            Delete
          </button>
        )}
      </div>

      {/* Comment section (toggleable) */}
      {showComments && <CommentSection postId={post._id} />}
    </div>
  );
}