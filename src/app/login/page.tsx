'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
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
      const response = await api.post('/auth/login', formData);
      login(response.data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-slate-800">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8 text-sm">Please enter your details to sign in</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm font-semibold"
            >
              <option value="user">User / Buyer</option>
              <option value="seller">Seller / Merchant</option>
              <option value="delivery">Delivery Partner</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email or Phone</label>
            <input
              type="text"
              required
              placeholder="e.g. john@example.com"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-600 font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
