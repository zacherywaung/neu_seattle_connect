const express        = require('express');
const CourseThread   = require('../models/CourseThread');
const Course = require('../models/Course');
const CourseSummary  = require('../models/CourseSummary');
const { protect }    = require('../middleware/auth');

const router = express.Router();

// GET /api/courses — returns all courses from seed data
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

// DELETE /api/courses/:code/threads/:threadId — delete your own thread
router.delete('/:code/threads/:threadId', protect, async (req, res) => {
  try {
    const thread = await CourseThread.findById(req.params.threadId);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

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

// GET /api/courses/:code/summary — get or generate AI summary
router.get('/:code/summary', async (req, res) => {
  const courseCode = req.params.code.toUpperCase();

  try {
    const threads = await CourseThread.find({ courseCode });
    if (threads.length < 3) {
      return res.json({ success: true, data: null });
    }

    // Check cache
    const cached = await CourseSummary.findOne({ courseCode });
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newThreads = threads.length - (cached?.threadCount || 0);

    if (cached && cached.generatedAt > sevenDaysAgo && newThreads < 10) {
      return res.json({ success: true, data: cached });
    }

    // Compress threads — only extract key fields, truncated
    const compressed = threads.slice(0, 30).map(t => ({
      workload: t.workload,
      style:    t.learningStyle?.slice(0, 30) || '',
      career:   t.careerRelevance?.slice(0, 30) || '',
      takeaway: t.takeaway?.slice(0, 80) || '',
    }));

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Based on these student reviews for ${courseCode}, provide a concise summary in JSON format only, no other text:
${JSON.stringify(compressed)}

Return exactly this JSON:
{
  "learningStyle": "one sentence about learning style",
  "careerRelevance": "one sentence about career relevance",
  "summary": "one sentence overall impression"
}`,
        }],
      }),
    });

    const aiData = await response.json();
    // const text   = aiData.content[0].text.trim();
    // const parsed = JSON.parse(text);
    console.log('AI raw response:', JSON.stringify(aiData));
    const text   = aiData.content?.[0]?.text?.trim();
    if (!text) throw new Error('Empty AI response');
    const clean  = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Save to cache
    await CourseSummary.findOneAndUpdate(
      { courseCode },
      { ...parsed, threadCount: threads.length, generatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.json({ success: true, data: null });
  }
});

module.exports = router;