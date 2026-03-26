const express     = require('express');
const Post        = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts
// Supports: ?category=Events|Projects|General  and  ?tag=tagname
// Both can be combined: ?category=Events&tag=AI
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.tag)      filter.tags = req.query.tag;

    const posts = await Post.find(filter)
      .populate('author', 'name major year')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (err) {
    console.error('Get posts error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// POST /api/posts — requires login
router.post('/', protect, async (req, res) => {
  try {
    const { category, title, content, tags, images } = req.body;

    if (!category || !title || !content) {
      return res.status(400).json({ success: false, message: 'Category, title, and content are required' });
    }

    const validCategories = ['Events', 'Projects', 'General'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Category must be Events, Projects, or General' });
    }

    const post = await Post.create({
      author: req.user.id,
      category,
      title,
      content,
      tags: tags || [],
      images: images || [],
    });

    // Populate author info before returning
    await post.populate('author', 'name major year');

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// PATCH /api/posts/:id/react — toggle a reaction, requires login
router.patch('/:id/react', protect, async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: 'Reaction type is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const users   = post.reactions.get(type) || [];
    const uid     = req.user.id;
    const updated = users.map(id => id.toString()).includes(uid)
      ? users.filter(id => id.toString() !== uid)
      : [...users, uid];

    post.reactions.set(type, updated);
    await post.save();

    res.json({ success: true, data: post });
  } catch (err) {
    console.error('React to post error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update reaction' });
  }
});

// DELETE /api/posts/:id — only the author can delete, requires login
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

module.exports = router;