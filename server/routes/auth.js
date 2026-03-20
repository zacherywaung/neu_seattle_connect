const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Only allow NEU email addresses
  if (!email.endsWith('@northeastern.edu')) {
    return res.status(400).json({ success: false, message: 'Please register with your NEU email address' });
  }

  // Check if email is already registered
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'This email is already registered' });
  }

  // Hash password and save user
  const hashed = await bcrypt.hash(password, 10);
  const user   = await User.create({ name, email, password: hashed });

  // Issue JWT (valid for 7 days)
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ success: false, message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

module.exports = router;