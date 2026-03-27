const express     = require('express');
const Comment     = require('../models/Comment');
const Notification   = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/comments/:postId — get all comments for a post
// Returns top-level comments with their replies nested inside
router.get('/:postId', async (req, res) => {
  try {
    // Get all top-level comments (no parent)
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate('author', 'name avatar major year')
      .sort({ createdAt: -1 });

    // For each top-level comment, fetch its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'name avatar major year')
          .sort({ createdAt: 1 });
        return { ...comment.toObject(), replies };
      })
    );

    res.json({ success: true, data: commentsWithReplies });
  } catch (err) {
    console.error('Get comments error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// POST /api/comments/:postId — post a new top-level comment, requires login
router.post('/:postId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const comment = await Comment.create({
      post:    req.params.postId,
      author:  req.user.id,
      content,
    });

    await comment.populate('author', 'name avatar major year');

    // Create notification for post author (if not commenting on own post)
    const Post = require('../models/Post');
    const post = await Post.findById(req.params.postId);
    if (post && post.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.author,
        sender: req.user.id,
        type: 'comment',
        post: post._id,
      });
    }
    
    res.status(201).json({ success: true, data: { ...comment.toObject(), replies: [] } });
  } catch (err) {
    console.error('Create comment error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
});

// POST /api/comments/:commentId/reply — reply to a comment, requires login
router.post('/:commentId/reply', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const parent = await Comment.findById(req.params.commentId);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reply = await Comment.create({
      post:          parent.post,
      author:        req.user.id,
      content,
      parentComment: parent._id,
    });

    await reply.populate('author', 'name avatar major year');
    res.status(201).json({ success: true, data: reply });
  } catch (err) {
    console.error('Reply error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to post reply' });
  }
});

// PATCH /api/comments/:commentId/like — toggle like on a comment, requires login
router.patch('/:commentId/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const uid = req.user.id;
    const liked = comment.likes.map(id => id.toString()).includes(uid);
    comment.likes = liked
      ? comment.likes.filter(id => id.toString() !== uid)
      : [...comment.likes, uid];

    await comment.save();
    res.json({ success: true, data: comment });
  } catch (err) {
    console.error('Like comment error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update like' });
  }
});

// DELETE /api/comments/:commentId — delete a comment, only author can delete
router.delete('/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    // Also delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error('Delete comment error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});

module.exports = router;