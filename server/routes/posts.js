const express     = require('express');
const Post        = require('../models/Post');
const Notification   = require('../models/Notification');
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
      .populate('author', 'name avatar major year')
      .populate('signups', 'name avatar major')
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
    await post.populate('author', 'name avatar major year');

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
    await post.populate('author', 'name avatar major');

    // Create notification if liking (not unliking) and not own post
    const isLiking = !users.map(id => id.toString()).includes(uid);
    if (isLiking && post.author.toString() !== uid) {
      await Notification.create({
        recipient: post.author,
        sender: uid,
        type: 'like',
        post: post._id,
      });
    }

    res.json({ success: true, data: post });
  } catch (err) {
    console.error('React to post error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update reaction' });
  }
});

// PATCH /api/posts/:id/signup — toggle signup for Events/Projects, requires login
router.patch('/:id/signup', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Only Events and Projects support signups
    if (!['Events', 'Projects'].includes(post.category)) {
      return res.status(400).json({ success: false, message: 'Signups are only available for Events and Projects' });
    }

    const uid = req.user.id;
    const alreadySignedUp = post.signups.map(id => id.toString()).includes(uid);

    if (alreadySignedUp) {
      // Cancel signup
      post.signups = post.signups.filter(id => id.toString() !== uid);
    } else {
      // Sign up
      post.signups.push(uid);

      // Notify the post author (only on signup, not on cancel)
      if (post.author.toString() !== uid) {
        await Notification.create({
          recipient: post.author,
          sender: uid,
          type: 'signup',
          post: post._id,
        });
      }
    }

    await post.save();

    // Populate signups with name and avatar so frontend can display the list
    await post.populate('signups', 'name avatar major');
    await post.populate('author', 'name avatar major year');

    res.json({ success: true, signedUp: !alreadySignedUp, data: post });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update signup' });
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