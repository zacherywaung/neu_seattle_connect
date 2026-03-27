import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get('/api/courses');
        setCourses(res.data.data || []);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handle "Go" button — navigate directly to course detail
  const handleGo = (e) => {
    e.preventDefault();
    const code = search.trim().toUpperCase();
    if (code) {
      navigate(`/courses/${code}`);
    }
  };

  // Filter displayed course cards
  const filtered = courses.filter((code) =>
    code.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#C8102E] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Course Insights</h1>
          <p className="text-white/80">
            Read honest experiences from fellow NEU Seattle students
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search + Go: jump directly to a course */}
        <form onSubmit={handleGo} className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter course code (e.g. CS5800)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-[#e5e5e5] rounded-lg bg-white
                       text-[#111111] placeholder-[#999] focus:outline-none
                       focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#C8102E] text-white font-semibold rounded-lg
                       hover:bg-[#a00d24] transition-colors"
          >
            Go
          </button>
        </form>

        {/* Filter existing courses */}
        <input
          type="text"
          placeholder="Filter listed courses..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg bg-white mb-6
                     text-[#111111] placeholder-[#999] focus:outline-none
                     focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
        />

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-[#e5e5e5] border-t-[#C8102E] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#555555]">Loading courses...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-[#e5e5e5]">
            <p className="text-4xl mb-4">📚</p>
            <h3 className="text-lg font-semibold text-[#111111] mb-2">
              {filter ? 'No courses match your filter' : 'No courses yet'}
            </h3>
            <p className="text-[#555555]">
              {filter
                ? 'Try a different keyword'
                : 'Be the first to share a course insight! Use the search bar above to go to a course page.'}
            </p>
          </div>
        )}

        {/* Course grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((code) => (
              <button
                key={code}
                onClick={() => navigate(`/courses/${code}`)}
                className="bg-white border border-[#e5e5e5] rounded-lg p-6 text-left
                           hover:border-[#C8102E] hover:shadow-md transition-all
                           group cursor-pointer"
              >
                <p className="text-xs font-medium text-[#C8102E] uppercase tracking-wide mb-1">
                  Course
                </p>
                <h2 className="text-xl font-bold text-[#111111] group-hover:text-[#C8102E] transition-colors">
                  {code}
                </h2>
                <p className="text-sm text-[#555555] mt-2">View insights →</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}