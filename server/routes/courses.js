const express      = require('express');
const CourseThread = require('../models/CourseThread');
const { protect }  = require('../middleware/auth');

const router = express.Router();

// GET /api/courses  — returns a list of all unique course codes
router.get('/', async (req, res) => {
  const courses = await CourseThread.distinct('courseCode');
  res.json({ success: true, data: courses });
});

// GET /api/courses/:code/threads  — all threads for a specific course
router.get('/:code/threads', async (req, res) => {
  const threads = await CourseThread.find({ courseCode: req.params.code })
    .populate('author', 'name major year')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: threads });
});

// POST /api/courses/:code/threads  — post a new thread, requires login
router.post('/:code/threads', protect, async (req, res) => {
  const { courseName, learningStyle, workload, careerRelevance, takeaway } = req.body;
  const thread = await CourseThread.create({
    courseCode: req.params.code,
    courseName,
    author: req.user.id,
    learningStyle,
    workload,
    careerRelevance,
    takeaway,
  });
  res.status(201).json({ success: true, data: thread });
});

module.exports = router;