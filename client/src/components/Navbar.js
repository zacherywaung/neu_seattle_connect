import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../api';

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem('token');
  const userName  = localStorage.getItem('userName');
  const userId    = localStorage.getItem('userId');

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/api/notifications');
        setUnreadCount(res.data.unreadCount);
        setNotifications(res.data.data);
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };
    fetchNotifications();
  }, [token]);

  const handleBellClick = async () => {
    setShowNotif(!showNotif);
    if (!showNotif && unreadCount > 0) {
      try {
        await API.patch('/api/notifications/read-all');
        setUnreadCount(0);
      } catch (err) {
        console.error('Failed to mark as read');
      }
    }
  };

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

      {/* Nav links — hidden on mobile */}
      <div className="hidden sm:flex items-center gap-1">
        <Link to="/feed"    className={linkClass('/feed')}>Feed</Link>
        <Link to="/events"  className={linkClass('/events')}>Events</Link>
        <Link to="/courses" className={linkClass('/courses')}>Courses</Link>
      </div>

      {/* Auth area */}
      <div className="flex items-center gap-2">
        {token ? (
          <>
            {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  className="text-white text-opacity-80 hover:text-white text-lg px-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#C8102E] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-lg border border-[#e5e5e5] z-50 overflow-hidden max-w-[calc(100vw-16px)]">
                    <div className="px-4 py-3 border-b border-[#e5e5e5]">
                      <p className="text-sm font-semibold text-[#111111]">Notifications</p>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#555555] px-4 py-4">No notifications yet.</p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n._id} className={`px-4 py-3 border-b border-[#f0f0f0] text-xs ${!n.read ? 'bg-red-50' : ''}`}>
                            <span className="font-semibold text-[#111111]">{n.sender?.name}</span>
                            <span className="text-[#555555]"> {n.type === 'like' ? 'liked' : 'commented on'} your post </span>
                            <span className="font-medium text-[#111111]">"{n.post?.title}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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