const express     = require('express');
const User        = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me — get the currently logged-in user's profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Get current user error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// GET /api/users/:id — view any user's public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/me — edit your own profile, requires login
router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'major', 'year', 'country', 'interests', 'bio'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router;