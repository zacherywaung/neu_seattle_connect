const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:  { type: String, enum: ['Events', 'Projects', 'General'], required: true },
  title:     { type: String, required: true },
  content:   { type: String, required: true },
  images:    { type: [String], default: [] },   // Cloudinary image URLs
  tags:      { type: [String], default: [] },
  reactions: { type: Map, of: [mongoose.Schema.Types.ObjectId], default: {} },
  signups:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Enable full-text search on title and content
PostSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', PostSchema);