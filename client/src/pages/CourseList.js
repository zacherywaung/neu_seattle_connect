import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

const workloadStyle = {
  Light:  'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Heavy:  'bg-red-100 text-red-800',
};

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get('/api/courses');
        setCourses(res.data.data || []);
      } catch {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter((c) =>
    c.code.toLowerCase().includes(filter.toLowerCase()) ||
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Navbar />

      <div className="bg-[#C8102E] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Course Insights</h1>
          <p className="text-white/80">Read honest experiences from fellow NEU Seattle students</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        <input
          type="text"
          placeholder="Search by course code or name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg bg-white mb-6 text-[#111111] placeholder-[#999] focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
        />

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-[#e5e5e5] border-t-[#C8102E] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#555555]">Loading courses...</p>
          </div>
        )}

        {error && <div className="text-center py-16"><p className="text-red-600">{error}</p></div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-[#e5e5e5]">
            <p className="text-4xl mb-4">📚</p>
            <h3 className="text-lg font-semibold text-[#111111] mb-2">
              {filter ? 'No courses match your search' : 'No courses yet'}
            </h3>
            <p className="text-[#555555]">{filter ? 'Try a different keyword' : 'Be the first to share a course insight!'}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <button
                key={c.code}
                onClick={() => navigate(`/courses/${c.code}`)}
                className="bg-white border border-[#e5e5e5] rounded-lg p-6 text-left hover:border-[#C8102E] hover:shadow-md transition-all group cursor-pointer"
              >
                <p className="text-xs font-medium text-[#C8102E] uppercase tracking-wide mb-1">{c.category}</p>
                <h2 className="text-xl font-bold text-[#111111] group-hover:text-[#C8102E] transition-colors">{c.code}</h2>
                <p className="text-sm text-[#555555] mt-1 mb-3">{c.name}</p>
                <div className="flex items-center justify-between mt-auto">
                  {c.workload ? (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${workloadStyle[c.workload]}`}>
                      {c.workload} workload
                    </span>
                  ) : (
                    <span className="text-xs text-[#999]">No reviews yet</span>
                  )}
                  {c.threadCount > 0 && (
                    <span className="text-xs text-[#999]">{c.threadCount} {c.threadCount === 1 ? 'review' : 'reviews'}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}