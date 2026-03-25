import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError('All fields are required.');
    }
    if (!form.email.endsWith('@northeastern.edu')) {
      return setError('Please use your NEU email address (@northeastern.edu).');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await API.post('/api/auth/register', form);
      const { token, user } = res.data;
      localStorage.setItem('token',    token);
      localStorage.setItem('userId',   user.id);
      localStorage.setItem('userName', user.name);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 w-full max-w-md">

          {/* Header */}
          <h1 className="text-2xl font-bold text-[#111111] mb-1">Create your account</h1>
          <p className="text-sm text-[#555555] mb-6">NEU Seattle students only.</p>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Jamie Lee"
                className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8102E] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">NEU Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@northeastern.edu"
                className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8102E] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8102E] transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#555555] hover:text-[#111111]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange
                }
                placeholder="Re-enter your password"
                className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8102E] transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#C8102E] text-white font-semibold text-sm py-3 rounded-lg hover:bg-red-800 transition disabled:opacity-60 mt-1"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Link to login */}
          <p className="text-xs text-[#555555] text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C8102E] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}