const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },  // stored as bcrypt hash
  avatar:     { type: String, default: '' },         // Cloudinary image URL
  major:     { type: String, default: '' },
  year:      { type: String, default: '' },      // e.g. "2025"
  country:   { type: String, default: '' },
  interests: { type: [String], default: [] },    // e.g. ["AI", "Music"]
  bio:       { type: String, default: '' },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);