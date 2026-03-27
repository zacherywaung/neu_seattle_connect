import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import CommentSection from './CommentSection';

// PostCard — displays a single post with like, save, comment, and delete actions
// Props:
//   post       — the post object from the backend
//   onDelete   — callback function called after a post is deleted (optional)
//   onUpdate   — callback function called after a post is liked/saved (optional)
//   isSaved    — whether the current user has saved this post (optional, default false)

export default function PostCard({ post, onDelete, onUpdate, isSaved: initialSaved = false, disableAuthorClick = false }) {
  const navigate      = useNavigate();
  const userId        = localStorage.getItem('userId');
  const token         = localStorage.getItem('token');
  const isOwnPost     = userId && post.author?._id === userId;
  const [showComments, setShowComments] = useState(false);

  // Save state
  const [saved, setSaved] = useState(initialSaved);
  const [saveAnim, setSaveAnim] = useState(false);

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
      // Trigger animation
      setSaveAnim(true);
      setTimeout(() => setSaveAnim(false), 400);
    } catch (err) {
      console.error('Save failed:', err);
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
          } ${saveAnim ? 'scale-125' : 'scale-100'}`}
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