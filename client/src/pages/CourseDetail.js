import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const workloadStyle = {
  Light: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Heavy: 'bg-red-100 text-red-800',
};

export default function CourseDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    courseName: '',
    learningStyle: '',
    workload: 'Medium',
    careerRelevance: '',
    takeaway: '',
  });

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await API.get(`/api/courses/${code}/threads`);
        setThreads(res.data.data || []);
      } catch (err) {
        setError('Failed to load threads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, [code]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.takeaway.trim()) return;
    setSubmitting(true);
    try {
      const res = await API.post(`/api/courses/${code}/threads`, form);
      setThreads([res.data.data, ...threads]);
      setForm({
        courseName: '',
        learningStyle: '',
        workload: 'Medium',
        careerRelevance: '',
        takeaway: '',
      });
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#C8102E] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/courses')}
            className="text-white/70 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors"
          >
            ← Back to all courses
          </button>
          <h1 className="text-3xl font-bold">{code.toUpperCase()}</h1>
          <p className="text-white/80 mt-1">
            {threads.length} {threads.length === 1 ? 'insight' : 'insights'} shared
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Share button — only if logged in */}
        {token && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-[#C8102E] text-white font-semibold rounded-lg
                       hover:bg-[#a00d24] transition-colors"
          >
            + Share My Experience
          </button>
        )}

        {/* Prompt to log in */}
        {!token && (
          <div className="mb-6 bg-white border border-[#e5e5e5] rounded-lg p-4 flex items-center justify-between">
            <p className="text-[#555555]">Log in to share your course experience</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-[#C8102E] text-white text-sm font-semibold rounded-lg
                         hover:bg-[#a00d24] transition-colors"
            >
              Log in
            </button>
          </div>
        )}

        {/* Hidden form — revealed on button click */}
        {showForm && (
          <div className="mb-6 bg-white border border-[#e5e5e5] rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#111111] mb-4">Share your experience</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Course name <span className="text-[#999] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={form.courseName}
                  onChange={handleChange}
                  placeholder="e.g. Algorithms"
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111]
                             placeholder-[#999] focus:outline-none focus:border-[#C8102E]
                             focus:ring-1 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Learning style <span className="text-[#999] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="learningStyle"
                  value={form.learningStyle}
                  onChange={handleChange}
                  placeholder="e.g. Lecture-heavy, project-based, self-study..."
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111]
                             placeholder-[#999] focus:outline-none focus:border-[#C8102E]
                             focus:ring-1 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Workload</label>
                <select
                  name="workload"
                  value={form.workload}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111]
                             bg-white focus:outline-none focus:border-[#C8102E]
                             focus:ring-1 focus:ring-[#C8102E]"
                >
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Career relevance <span className="text-[#999] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="careerRelevance"
                  value={form.careerRelevance}
                  onChange={handleChange}
                  placeholder="e.g. Very useful for SWE interviews"
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111]
                             placeholder-[#999] focus:outline-none focus:border-[#C8102E]
                             focus:ring-1 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Key takeaway <span className="text-[#C8102E]">*</span>
                </label>
                <textarea
                  name="takeaway"
                  value={form.takeaway}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="What's the most important thing a future student should know about this course?"
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111]
                             placeholder-[#999] focus:outline-none focus:border-[#C8102E]
                             focus:ring-1 focus:ring-[#C8102E] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !form.takeaway.trim()}
                  className="px-6 py-2 bg-[#C8102E] text-white font-semibold rounded-lg
                             hover:bg-[#a00d24] transition-colors disabled:opacity-50
                             disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : 'Post insight'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-[#e5e5e5] text-[#555555] rounded-lg
                             hover:bg-[#f0f0f0] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-[#e5e5e5] border-t-[#C8102E] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#555555]">Loading insights...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && threads.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-[#e5e5e5]">
            <p className="text-4xl mb-4">💬</p>
            <h3 className="text-lg font-semibold text-[#111111] mb-2">
              No insights yet for {code.toUpperCase()}
            </h3>
            <p className="text-[#555555]">Be the first to share your experience!</p>
          </div>
        )}

        {/* Thread list */}
        {!loading && !error && threads.length > 0 && (
          <div className="space-y-4">
            {threads.map((t) => (
              <div
                key={t._id}
                className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                {/* Author row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                      {t.author?.avatar ? (
                        <img src={t.author.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        t.author?.name?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111]">
                        {t.author?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-[#555555]">
                        {[t.author?.major, t.author?.year].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      workloadStyle[t.workload] || workloadStyle.Medium
                    }`}
                  >
                    {t.workload} workload
                  </span>
                </div>

                {/* Course name */}
                {t.courseName && (
                  <p className="text-sm font-medium text-[#C8102E] mb-2">{t.courseName}</p>
                )}

                {/* Takeaway */}
                <p className="text-[#111111] leading-relaxed mb-4">{t.takeaway}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {t.learningStyle && (
                    <span className="text-xs bg-[#f8f8f8] text-[#555555] px-3 py-1 rounded-full border border-[#e5e5e5]">
                      📖 {t.learningStyle}
                    </span>
                  )}
                  {t.careerRelevance && (
                    <span className="text-xs bg-[#f8f8f8] text-[#555555] px-3 py-1 rounded-full border border-[#e5e5e5]">
                      💼 {t.careerRelevance}
                    </span>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-[#999] mt-4">
                  {new Date(t.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}