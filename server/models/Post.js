const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:  { type: String, enum: ['Events', 'Projects', 'General'], required: true },
  title:     { type: String, required: true },
  content:   { type: String, required: true },
  tags:      { type: [String], default: [] },
  // reactions stores arrays of user IDs, e.g. { "like": ["userId1", "userId2"] }
  reactions: { type: Map, of: [mongoose.Schema.Types.ObjectId], default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);