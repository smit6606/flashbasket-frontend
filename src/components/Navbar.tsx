'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          FlashBasket
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Browse</Link>
        <Link href="/sellers" className="hover:text-emerald-600 transition-colors">Nearby Sellers</Link>
        {user?.role === 'user' && <Link href="/orders" className="hover:text-emerald-600 transition-colors">Orders</Link>}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
              🛒
            </Link>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <span className="text-sm font-medium">{user.user_name}</span>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2 text-sm font-bold hover:text-emerald-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all transform hover:-translate-y-0.5">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        nav {
          border-bottom: 1px solid var(--card-border);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
