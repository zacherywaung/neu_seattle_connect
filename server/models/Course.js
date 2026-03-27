const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code:     { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  category: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);