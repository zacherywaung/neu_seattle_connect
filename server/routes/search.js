const express      = require('express');
const Post         = require('../models/Post');
const User         = require('../models/User');
const CourseThread = require('../models/CourseThread');

const router = express.Router();

// GET /api/search?q=keyword
// Searches posts, users, and courses simultaneously
// Returns: { posts: [...], users: [...], courses: [...] }
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const keyword = q.trim();
    const regex   = new RegExp(keyword, 'i');  // case-insensitive match

    // Run all three searches in parallel for speed
    const [posts, users, courses] = await Promise.all([
      Post.find({
        $or: [{ title: regex }, { content: regex }, { tags: regex }],
      })
        .populate('author', 'name avatar major')
        .sort({ createdAt: -1 })
        .limit(10),

      User.find({
        $or: [{ name: regex }, { major: regex }, { bio: regex }],
      })
        .select('-password')
        .limit(10),

      CourseThread.find({
        $or: [{ courseCode: regex }, { courseName: regex }, { takeaway: regex }],
      })
        .populate('author', 'name avatar major')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      data: { posts, users, courses },
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

module.exports = router;