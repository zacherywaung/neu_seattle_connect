const express    = require('express');
const multer     = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'neu-seattle-connect',   // all uploads go into this folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],  // max width 1200px
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max per file
});

// POST /api/upload/image — upload a single image, requires login
// Returns: { success: true, url: "https://res.cloudinary.com/..." }
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    res.json({ success: true, url: req.file.path });
  } catch (err) {
    console.error('Image upload error:', err.message);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
});

// POST /api/upload/avatar — upload avatar, requires login
// Automatically resizes to 400x400 square crop
router.post('/avatar', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Re-upload with avatar-specific transformation (square crop)
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'neu-seattle-connect/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error('Avatar upload error:', err.message);
    res.status(500).json({ success: false, message: 'Avatar upload failed' });
  }
});

module.exports = router;