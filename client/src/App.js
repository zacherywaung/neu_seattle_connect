import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing      from './pages/Landing';
import Register     from './pages/Register';
import Login        from './pages/Login';
import Feed         from './pages/Feed';
import Events       from './pages/Events';
import CourseList   from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import Profile      from './pages/Profile';

// ProtectedRoute: if user is not logged in, redirect to /login
// Usage: <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    
    
    <BrowserRouter>
      <Routes>
        {/* Public routes — anyone can visit */}
        <Route path="/"          element={<Landing />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/feed"      element={<Feed />} />
        <Route path="/events"    element={<Events />} />
        <Route path="/courses"   element={<CourseList />} />
        <Route path="/courses/:code" element={<CourseDetail />} />

        {/* Protected routes — login required */}
        <Route path="/profile/:id" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        {/* Fallback: redirect unknown URLs to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    
  );
}