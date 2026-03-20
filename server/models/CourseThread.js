const mongoose = require('mongoose');

const CourseThreadSchema = new mongoose.Schema({
  courseCode:      { type: String, required: true },   // e.g. "CS5610"
  courseName:      { type: String, default: '' },
  author:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learningStyle:   { type: String, default: '' },
  workload:        { type: String, enum: ['Light', 'Medium', 'Heavy'], default: 'Medium' },
  careerRelevance: { type: String, default: '' },
  takeaway:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('CourseThread', CourseThreadSchema);