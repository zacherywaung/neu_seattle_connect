const express        = require('express');
const Post           = require('../models/Post');
const { protect }    = require('../middleware/auth');

const router = express.Router();

// GET /api/posts  — supports ?category=Events&tag=AI
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.tag)      filter.tags = req.query.tag;

  const posts = await Post.find(filter)
    .populate('author', 'name major year')  // join author info
    .sort({ createdAt: -1 });               // newest first

  res.json({ success: true, data: posts });
});

// POST /api/posts  — requires login
router.post('/', protect, async (req, res) => {
  const { category, title, content, tags } = req.body;
  const post = await Post.create({
    author: req.user.id,
    category,
    title,
    content,
    tags: tags || [],
  });
  res.status(201).json({ success: true, data: post });
});

// PATCH /api/posts/:id/react  — toggle a reaction, requires login
router.patch('/:id/react', protect, async (req, res) => {
  const { type } = req.body;  // e.g. { type: "like" }
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

  const users   = post.reactions.get(type) || [];
  const uid     = req.user.id;
  // If already reacted, remove; otherwise add
  const updated = users.includes(uid)
    ? users.filter(id => id.toString() !== uid)
    : [...users, uid];

  post.reactions.set(type, updated);
  await post.save();

  res.json({ success: true, data: post });
});

// DELETE /api/posts/:id  — only the author can delete
router.delete('/:id', protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.author.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
  }

  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted' });
});

module.exports = router;