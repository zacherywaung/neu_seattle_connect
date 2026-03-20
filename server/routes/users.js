const express     = require('express');
const User        = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id  — view any user's profile (password excluded)
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// PUT /api/users/me  — edit your own profile, requires login
router.put('/me', protect, async (req, res) => {
  const allowed = ['name', 'major', 'year', 'country', 'interests', 'bio'];
  const updates = {};
  allowed.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
  res.json({ success: true, data: user });
});

module.exports = router;