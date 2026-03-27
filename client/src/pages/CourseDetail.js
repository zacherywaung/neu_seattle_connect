import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const workloadStyle = {
  Light:  'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Heavy:  'bg-red-100 text-red-800',
};

const workloadBar = {
  Light:  { width: '33%',  color: 'bg-green-400' },
  Medium: { width: '66%',  color: 'bg-yellow-400' },
  Heavy:  { width: '100%', color: 'bg-red-400' },
};

export default function CourseDetail() {
  const { code }        = useParams();
  const navigate        = useNavigate();
  const token           = localStorage.getItem('token');
  const currentUserId   = localStorage.getItem('userId');

  const [threads, setThreads]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [aiSummary, setAiSummary]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    courseName: '', learningStyle: '', workload: 'Medium', careerRelevance: '', takeaway: '',
  });

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await API.get(`/api/courses/${code}/threads`);
        const data = res.data.data || [];
        setThreads(data);

        if (data.length >= 3) {
          try {
            const summaryRes = await API.get(`/api/courses/${code}/summary`);
            if (summaryRes.data.data) setAiSummary(summaryRes.data.data);
          } catch {
            // fail silently
          }
        }
      } catch {
        setError('Failed to load threads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, [code]);

  const workloadCount = threads.reduce((acc, t) => {
    acc[t.workload] = (acc[t.workload] || 0) + 1;
    return acc;
  }, {});
  const dominantWorkload = Object.entries(workloadCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.takeaway.trim()) return;
    setSubmitting(true);
    try {
      const res = await API.post(`/api/courses/${code}/threads`, form);
      setThreads([res.data.data, ...threads]);
      setForm({ courseName: '', learningStyle: '', workload: 'Medium', careerRelevance: '', takeaway: '' });
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (threadId) => {
    if (!window.confirm('Are you sure you want to delete this insight?')) return;
    try {
      await API.delete(`/api/courses/${code}/threads/${threadId}`);
      setThreads(threads.filter(t => t._id !== threadId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete. Please try again.');
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
            className="text-white/70 hover:text-white text-sm mb-4 inline-flex items-center gap-1"
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

        {/* At a glance card */}
        {!loading && threads.length > 0 && (
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-[#111111] mb-4 uppercase tracking-wide">
              At a glance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

              {/* Workload */}
              <div>
                <p className="text-xs text-[#999] mb-1">Typical workload</p>
                {dominantWorkload && (
                  <>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${workloadStyle[dominantWorkload]}`}>
                      {dominantWorkload}
                    </span>
                    <div className="mt-2 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${workloadBar[dominantWorkload].color}`}
                        style={{ width: workloadBar[dominantWorkload].width }}
                      />
                    </div>
                    <p className="text-xs text-[#999] mt-1">
                      {Object.entries(workloadCount).map(([k, v]) => `${v} ${k}`).join(' · ')}
                    </p>
                  </>
                )}
              </div>

              {/* Learning style — AI powered */}
              <div>
                <p className="text-xs text-[#999] mb-2">Learning style</p>
                {aiSummary?.learningStyle ? (
                  <p className="text-sm text-[#555555]">{aiSummary.learningStyle}</p>
                ) : (
                  <p className="text-xs text-[#999]">No data yet</p>
                )}
              </div>

              {/* Career relevance — AI powered */}
              <div>
                <p className="text-xs text-[#999] mb-2">Career relevance</p>
                {aiSummary?.careerRelevance ? (
                  <p className="text-sm text-[#555555]">{aiSummary.careerRelevance}</p>
                ) : (
                  <p className="text-xs text-[#999]">No data yet</p>
                )}
              </div>

            </div>

            {/* AI summary row */}
            {aiSummary?.summary && (
              <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                <p className="text-xs text-[#999] mb-1">✦ AI summary</p>
                <p className="text-sm text-[#555555]">{aiSummary.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* Share button */}
        {token && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-[#C8102E] text-white font-semibold rounded-lg hover:bg-[#a00d24] transition-colors"
          >
            + Share My Experience
          </button>
        )}

        {/* Login prompt */}
        {!token && (
          <div className="mb-6 bg-white border border-[#e5e5e5] rounded-lg p-4 flex items-center justify-between">
            <p className="text-[#555555]">Log in to share your course experience</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-[#C8102E] text-white text-sm font-semibold rounded-lg hover:bg-[#a00d24] transition-colors"
            >
              Log in
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6 bg-white border border-[#e5e5e5] rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#111111] mb-4">Share your experience</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Course name <span className="text-[#999] font-normal">(optional)</span>
                </label>
                <input type="text" name="courseName" value={form.courseName} onChange={handleChange}
                  placeholder="e.g. Algorithms"
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Learning style <span className="text-[#999] font-normal">(optional)</span>
                </label>
                <input type="text" name="learningStyle" value={form.learningStyle} onChange={handleChange}
                  placeholder="e.g. Lecture-heavy, project-based, self-study..."
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Workload</label>
                <select name="workload" value={form.workload} onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] bg-white focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]">
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Career relevance <span className="text-[#999] font-normal">(optional)</span>
                </label>
                <input type="text" name="careerRelevance" value={form.careerRelevance} onChange={handleChange}
                  placeholder="e.g. Very useful for SWE interviews"
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Key takeaway <span className="text-[#C8102E]">*</span>
                </label>
                <textarea name="takeaway" value={form.takeaway} onChange={handleChange} required rows={4}
                  placeholder="What's the most important thing a future student should know about this course?"
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting || !form.takeaway.trim()}
                  className="px-6 py-2 bg-[#C8102E] text-white font-semibold rounded-lg hover:bg-[#a00d24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Posting...' : 'Post insight'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-[#e5e5e5] text-[#555555] rounded-lg hover:bg-[#f0f0f0] transition-colors">
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
        {error && <div className="text-center py-16"><p className="text-red-600">{error}</p></div>}

        {/* Empty state */}
        {!loading && !error && threads.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-[#e5e5e5]">
            <p className="text-4xl mb-4">💬</p>
            <h3 className="text-lg font-semibold text-[#111111] mb-2">No insights yet for {code.toUpperCase()}</h3>
            <p className="text-[#555555]">Be the first to share your experience!</p>
          </div>
        )}

        {/* Thread list */}
        {!loading && !error && threads.length > 0 && (
          <div className="space-y-4">
            {threads.map((t) => (
              <div key={t._id} className="bg-white border border-[#e5e5e5] rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                      {t.author?.avatar
                        ? <img src={t.author.avatar} alt="" className="w-full h-full object-cover" />
                        : t.author?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111]">{t.author?.name || 'Anonymous'}</p>
                      <p className="text-xs text-[#555555]">
                        {[t.author?.major, t.author?.year].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${workloadStyle[t.workload] || workloadStyle.Medium}`}>
                      {t.workload} workload
                    </span>
                    {currentUserId && t.author?._id === currentUserId && (
                      <button onClick={() => handleDelete(t._id)}
                        className="text-xs text-[#999] hover:text-red-600 transition-colors px-2 py-1">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                {t.courseName && <p className="text-sm font-medium text-[#C8102E] mb-2">{t.courseName}</p>}
                <p className="text-[#111111] leading-relaxed mb-4">{t.takeaway}</p>
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
                <p className="text-xs text-[#999] mt-4">
                  {new Date(t.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}