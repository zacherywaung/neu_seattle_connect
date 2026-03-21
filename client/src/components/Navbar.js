import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem('token');
  const userName  = localStorage.getItem('userName');
  const userId    = localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // Helper: highlight the active nav link
  const linkClass = (path) =>
    `px-3 py-1 rounded text-sm font-medium transition-colors ${
      location.pathname.startsWith(path)
        ? 'bg-white bg-opacity-20 text-white'
        : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10'
    }`;

  return (
    <nav className="bg-[#C8102E] px-6 py-3 flex items-center justify-between">
      {/* Brand */}
      <Link to="/" className="text-white font-semibold text-lg tracking-tight">
        NEU Seattle Connect
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        <Link to="/feed"    className={linkClass('/feed')}>Feed</Link>
        <Link to="/events"  className={linkClass('/events')}>Events</Link>
        <Link to="/courses" className={linkClass('/courses')}>Courses</Link>
      </div>

      {/* Auth area */}
      <div className="flex items-center gap-2">
        {token ? (
          <>
            <Link
              to={`/profile/${userId}`}
              className="flex items-center gap-2 text-white text-sm hover:opacity-80"
            >
              {/* Avatar circle showing initials */}
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xs font-semibold text-white">
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="hidden sm:inline">{userName}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-white text-opacity-80 text-sm border border-white border-opacity-40 px-3 py-1 rounded hover:bg-white hover:bg-opacity-10"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-white text-sm border border-white border-opacity-50 px-3 py-1 rounded hover:bg-white hover:bg-opacity-10"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-white text-[#C8102E] text-sm font-semibold px-3 py-1 rounded hover:bg-opacity-90"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}