import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

// CommentSection — shows all comments for a post and allows posting new ones
// Props:
//   postId — the _id of the post

export default function CommentSection({ postId }) {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const userId    = localStorage.getItem('userId');

  const [comments,    setComments]    = useState([]);
  const [newComment,  setNewComment]  = useState('');
  const [replyingTo,  setReplyingTo]  = useState(null); // commentId being replied to
  const [replyText,   setReplyText]   = useState('');
  const [loading,     setLoading]     = useState(true);

  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await API.get(`/api/comments/${postId}`);
        setComments(res.data.data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handlePostComment = async () => {
    if (!token) { navigate('/login'); return; }
    if (!newComment.trim()) return;
    try {
      const res = await API.post(`/api/comments/${postId}`, { content: newComment });
      setComments([res.data.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleReply = async (commentId) => {
    if (!token) { navigate('/login'); return; }
    if (!replyText.trim()) return;
    try {
      const res = await API.post(`/api/comments/${commentId}/reply`, { content: replyText });
      // Add reply to the correct parent comment
      setComments(comments.map(c =>
        c._id === commentId
          ? { ...c, replies: [...(c.replies || []), res.data.data] }
          : c
      ));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!token) { navigate('/login'); return; }
    try {
      const res = await API.patch(`/api/comments/${commentId}/like`);
      setComments(comments.map(c =>
        c._id === commentId ? { ...c, likes: res.data.data.likes } : c
      ));
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/api/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // Author initials for avatar fallback
  const initials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const timeAgo = (dateStr) => {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (loading) return <p className="text-xs text-gray-400 mt-3">Loading comments...</p>;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* New comment input */}
      {token ? (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePostComment()}
            placeholder="Write a comment..."
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#C8102E]"
          />
          <button
            onClick={handlePostComment}
            className="bg-[#C8102E] text-white text-sm px-4 py-2 rounded-lg hover:bg-red-800"
          >
            Post
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-3">
          <span
            onClick={() => navigate('/login')}
            className="text-[#C8102E] cursor-pointer hover:underline"
          >
            Log in
          </span> to join the conversation
        </p>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-xs text-gray-400">No comments yet. Be the first!</p>
      ) : (
        comments.map(comment => (
          <div key={comment._id} className="mb-4">
            {/* Comment */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                {comment.author?.avatar
                  ? <img src={comment.author.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                  : initials(comment.author?.name)
                }
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-gray-800">{comment.author?.name}</span>
                  <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                </div>
                {/* Comment actions */}
                <div className="flex items-center gap-3 mt-1 ml-1">
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className={`text-xs ${
                      comment.likes?.includes(userId) ? 'text-[#C8102E]' : 'text-gray-400'
                    } hover:text-[#C8102E]`}
                  >
                    ♥ {comment.likes?.length || 0}
                  </button>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    Reply
                  </button>
                  <span className="text-xs text-gray-300">{timeAgo(comment.createdAt)}</span>
                  {comment.author?._id === userId && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs text-gray-300 hover:text-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Reply input */}
                {replyingTo === comment._id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleReply(comment._id)}
                      placeholder="Write a reply..."
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#C8102E]"
                    />
                    <button
                      onClick={() => handleReply(comment._id)}
                      className="bg-[#C8102E] text-white text-xs px-3 py-1.5 rounded-lg"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 ml-2 border-l-2 border-gray-100 pl-3">
                    {comment.replies.map(reply => (
                      <div key={reply._id} className="flex gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                          {initials(reply.author?.name)}
                        </div>
                        <div className="bg-gray-50 rounded-xl px-3 py-1.5 flex-1">
                          <span className="text-xs font-semibold text-gray-800">{reply.author?.name}</span>
                          <p className="text-sm text-gray-700 mt-0.5">{reply.content}</p>
                          <span className="text-xs text-gray-300">{timeAgo(reply.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}