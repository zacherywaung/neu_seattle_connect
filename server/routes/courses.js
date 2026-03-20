const express      = require('express');
const CourseThread = require('../models/CourseThread');
const { protect }  = require('../middleware/auth');

const router = express.Router();

// GET /api/courses — returns all unique course codes that have threads
router.get('/', async (req, res) => {
  try {
    const courses = await CourseThread.distinct('courseCode');
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error('Get courses error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:code/threads — all threads for a specific course
router.get('/:code/threads', async (req, res) => {
  try {
    const courseCode = req.params.code.toUpperCase();
    const threads = await CourseThread.find({ courseCode })
      .populate('author', 'name major year')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: threads });
  } catch (err) {
    console.error('Get threads error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch course threads' });
  }
});

// POST /api/courses/:code/threads — post a new thread, requires login
router.post('/:code/threads', protect, async (req, res) => {
  try {
    const { courseName, learningStyle, workload, careerRelevance, takeaway } = req.body;
    const courseCode = req.params.code.toUpperCase();

    // Validate required fields
    if (!takeaway) {
      return res.status(400).json({ success: false, message: 'Key takeaway is required' });
    }

    const validWorkloads = ['Light', 'Medium', 'Heavy'];
    if (workload && !validWorkloads.includes(workload)) {
      return res.status(400).json({ success: false, message: 'Workload must be Light, Medium, or Heavy' });
    }

    const thread = await CourseThread.create({
      courseCode,
      courseName,
      author: req.user.id,
      learningStyle,
      workload: workload || 'Medium',
      careerRelevance,
      takeaway,
    });

    await thread.populate('author', 'name major year');

    res.status(201).json({ success: true, data: thread });
  } catch (err) {
    console.error('Create thread error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create thread' });
  }
});

module.exports = router;