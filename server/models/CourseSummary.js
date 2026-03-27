const mongoose = require('mongoose');

const CourseSummarySchema = new mongoose.Schema({
  courseCode:   { type: String, required: true, unique: true },
  learningStyle: { type: String, default: '' },
  careerRelevance: { type: String, default: '' },
  summary:      { type: String, default: '' },
  threadCount:  { type: Number, default: 0 },
  generatedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('CourseSummary', CourseSummarySchema);