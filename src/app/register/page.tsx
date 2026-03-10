'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    user_name: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      // Auto login after registration
      const loginResponse = await api.post('/auth/login', {
        identifier: formData.email,
        password: formData.password,
        role: formData.role
      });
      login(loginResponse.data);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 font-sans">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-slate-800 font-display">Join FlashBasket</h1>
        <p className="text-slate-500 text-center mb-8 text-sm">Create an account to start shopping or selling</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">I want to be a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm font-semibold"
            >
              <option value="user">User / Buyer</option>
              <option value="seller">Seller / Merchant</option>
              <option value="delivery">Delivery Partner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
            <input
              name="user_name"
              type="text"
              required
              placeholder="e.g. john_doe"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="e.g. john@example.com"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
            <input
              name="phone"
              type="text"
              required
              placeholder="+91 00000 00000"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 mt-4"
          >
            {loading ? 'Creating Account...' : 'Sign Up Now'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
