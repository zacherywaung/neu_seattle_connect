const express      = require('express');
const CourseThread = require('../models/CourseThread');
const Course       = require('../models/Course');
const { protect }  = require('../middleware/auth');

const router = express.Router();

// GET /api/courses — returns all unique course codes that have threads
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
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
      .populate('author', 'name avatar major year')
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

    await thread.populate('author', 'name avatar major year');

    res.status(201).json({ success: true, data: thread });
  } catch (err) {
    console.error('Create thread error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create thread' });
  }
});

// DELETE /api/courses/:code/threads/:threadId — delete your own thread, requires login
router.delete('/:code/threads/:threadId', protect, async (req, res) => {
  try {
    const thread = await CourseThread.findById(req.params.threadId);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Only the author can delete their own thread
    if (thread.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this thread' });
    }

    await thread.deleteOne();
    res.json({ success: true, message: 'Thread deleted' });
  } catch (err) {
    console.error('Delete thread error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete thread' });
  }
});

module.exports = router;