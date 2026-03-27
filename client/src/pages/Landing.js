import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero section */}
      <div className="bg-[#C8102E] px-6 py-20 text-center">
        <span className="inline-block bg-white bg-opacity-20 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6 border border-white border-opacity-30">
          Now open — NEU Seattle students only
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {isLoggedIn ? (
            <>Welcome back{userName ? `, ${userName}` : ''}!</>
          ) : (
            <>Your campus,<br /><span className="text-white text-opacity-75">finally connected.</span></>
          )}
        </h1>
        <p className="text-white text-opacity-75 text-base max-w-xl mx-auto mb-8 leading-relaxed">
          {isLoggedIn
            ? 'Jump back into your campus community — check new posts, explore events, or share course insights.'
            : 'Find study partners, discover events, read honest course insights, and connect with classmates — all in one place built for NEU Seattle.'
          }
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/feed')}
                className="bg-white text-[#C8102E] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-opacity-90 transition"
              >
                Go to Feed
              </button>
              <button
                onClick={() => navigate('/events')}
                className="bg-transparent text-white font-medium text-sm px-6 py-3 rounded-lg border-2 border-white border-opacity-50 hover:bg-white hover:bg-opacity-10 transition"
              >
                Browse Events
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="bg-transparent text-white font-medium text-sm px-6 py-3 rounded-lg border-2 border-white border-opacity-50 hover:bg-white hover:bg-opacity-10 transition"
              >
                Course Insights
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-[#C8102E] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-opacity-90 transition"
              >
                Sign up with NEU email
              </button>
              <button
                onClick={() => navigate('/feed')}
                className="bg-transparent text-white font-medium text-sm px-6 py-3 rounded-lg border-2 border-white border-opacity-50 hover:bg-white hover:bg-opacity-10 transition"
              >
                Browse as guest
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#111111] px-6 py-5 flex justify-center gap-16 flex-wrap">
        <div className="text-center">
          <p className="text-white font-bold text-xl">NEU</p>
          <p className="text-gray-400 text-xs mt-0.5">Seattle campus</p>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-xl">3</p>
          <p className="text-gray-400 text-xs mt-0.5">core sections</p>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-xl">100%</p>
          <p className="text-gray-400 text-xs mt-0.5">student-run</p>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white px-6 py-16 flex-1">
        <p className="text-xs font-semibold tracking-widest text-gray-400 text-center uppercase mb-10">
          What you can do
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            {
              title: 'Community feed',
              desc: 'Post events, share projects, connect with classmates. Filter by Events, Projects, or General.',
            },
            {
              title: 'Course insights',
              desc: 'Real talk from students on workload, teaching style, and career relevance. No star ratings.',
            },
            {
              title: 'Search',
              desc: 'Find posts, people, and courses instantly across the whole platform.',
            },
            {
              title: 'Your profile',
              desc: 'Build your campus identity with your major, interests, bio, and the posts you\'ve shared.',
            },
          ].map((f) => (
            <div key={f.title} className="border border-[#e5e5e5] rounded-xl p-5">
              <p className="font-semibold text-[#111111] text-sm mb-2">{f.title}</p>
              <p className="text-[#555555] text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#f8f8f8] border-t border-[#e5e5e5] px-6 py-5 text-center">
        <p className="text-[#555555] text-xs">
          NEU Seattle Connect — Built by students, for students.
        </p>
      </div>
    </div>
  );
}